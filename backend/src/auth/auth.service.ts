import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';
import { DatabaseService } from '../vector-store/database.service';
import { MailService } from './mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly memoryService: MemoryService,
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  private get redis() {
    return this.memoryService.getRedisClient();
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  async sendOtp(rawEmail: string): Promise<{ success: boolean; message: string; expiresInSeconds: number }> {
    const email = this.normalizeEmail(rawEmail);

    if (!email || !email.includes('@')) {
      throw new HttpException('A valid email address is required.', HttpStatus.BAD_REQUEST);
    }

    if (this.redis) {
      // 1. Check lockout status (10-minute lock)
      const isLocked = await this.redis.get(`otp:lockout:${email}`);
      if (isLocked) {
        throw new HttpException('Too many failed attempts. Account temporarily locked for 10 minutes.', HttpStatus.TOO_MANY_REQUESTS);
      }

      // 2. Check 20-minute request rate limit (max 3 requests)
      const now = Date.now();
      const windowMs = 20 * 60 * 1000;
      const rawRequests = await this.redis.lrange(`otp:requests:${email}`, 0, -1);
      const validRequests = rawRequests
        .map((t) => parseInt(t, 10))
        .filter((t) => now - t < windowMs);

      if (validRequests.length >= 3) {
        throw new HttpException('OTP request limit exceeded. Maximum 3 OTP requests allowed every 20 minutes.', HttpStatus.TOO_MANY_REQUESTS);
      }

      await this.redis.rpush(`otp:requests:${email}`, String(now));
      await this.redis.expire(`otp:requests:${email}`, 1200);
    }

    // 3. Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // 4. Store OTP in Redis (5 min TTL = 300s)
    if (this.redis) {
      await this.redis.set(`otp:code:${email}`, otp, 'EX', 300);
      await this.redis.del(`otp:failed_attempts:${email}`);
    }

    // 5. Send via Google SMTP
    await this.mailService.sendOtpEmail(email, otp);
    this.logger.log(`[AUTH] Sent 6-digit OTP to ${email}`);

    return {
      success: true,
      message: 'Verification code sent to your email.',
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(rawEmail: string, submittedOtp: string): Promise<{ success: boolean; message: string; user: any; token: string }> {
    const email = this.normalizeEmail(rawEmail);
    const cleanOtp = submittedOtp ? submittedOtp.trim() : '';

    if (!email || !cleanOtp) {
      throw new HttpException('Email and verification code are required.', HttpStatus.BAD_REQUEST);
    }

    if (this.redis) {
      const isLocked = await this.redis.get(`otp:lockout:${email}`);
      if (isLocked) {
        throw new HttpException('Too many failed attempts. Account temporarily locked for 10 minutes.', HttpStatus.TOO_MANY_REQUESTS);
      }

      const storedOtp = await this.redis.get(`otp:code:${email}`);
      if (!storedOtp) {
        throw new HttpException('OTP expired or invalid. Please request a new code.', HttpStatus.BAD_REQUEST);
      }

      if (storedOtp !== cleanOtp) {
        const attempts = await this.redis.incr(`otp:failed_attempts:${email}`);
        await this.redis.expire(`otp:failed_attempts:${email}`, 300);

        if (attempts >= 3) {
          await this.redis.set(`otp:lockout:${email}`, 'locked', 'EX', 600); // 10 min lock
          await this.redis.del(`otp:code:${email}`);
          await this.redis.del(`otp:failed_attempts:${email}`);
          throw new HttpException('Too many failed attempts. Account temporarily locked for 10 minutes.', HttpStatus.TOO_MANY_REQUESTS);
        }

        const remaining = 3 - attempts;
        throw new HttpException(`Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, HttpStatus.BAD_REQUEST);
      }

      await this.redis.del(`otp:code:${email}`);
      await this.redis.del(`otp:failed_attempts:${email}`);
    }

    let user: any = null;
    try {
      const existingUserRes = await this.databaseService.query('SELECT id, email, created_at FROM users WHERE email = $1', [email]);
      if (existingUserRes.rows.length > 0) {
        user = existingUserRes.rows[0];
      } else {
        const newUserRes = await this.databaseService.query(
          'INSERT INTO users (email, full_name, created_at) VALUES ($1, $2, NOW()) RETURNING id, email, created_at',
          [email, email.split('@')[0]]
        );
        user = newUserRes.rows[0];
      }
    } catch (err: any) {
      this.logger.error(`[AUTH] DB user sync failed: ${err.message}`);
      user = { id: 1, email };
    }

    const tokenPayload = `${user.id}:${email}:${Date.now()}`;
    const token = crypto.createHmac('sha256', process.env.JWT_SECRET || 'careeratlas_secret').update(tokenPayload).digest('hex');

    this.logger.log(`[AUTH] Successfully verified OTP for ${email}`);
    return {
      success: true,
      message: 'Login successful.',
      user,
      token,
    };
  }
}
