import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MemoryService } from '../memory/memory.service';
import { DatabaseService } from '../vector-store/database.service';
import { MailService } from './mail.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let redisMock: any;
  let dbMock: any;
  let mailMock: any;

  beforeEach(async () => {
    const store: Record<string, string> = {};
    redisMock = {
      get: jest.fn((key: string) => Promise.resolve(store[key] || null)),
      set: jest.fn((key: string, val: string, mode?: string, ttl?: number) => {
        store[key] = val;
        return Promise.resolve('OK');
      }),
      del: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve(1);
      }),
      incr: jest.fn((key: string) => {
        const val = parseInt(store[key] || '0', 10) + 1;
        store[key] = String(val);
        return Promise.resolve(val);
      }),
      lrange: jest.fn((key: string, start: number, stop: number) => {
        const arr = store[key] ? JSON.parse(store[key]) : [];
        return Promise.resolve(arr);
      }),
      rpush: jest.fn((key: string, val: string) => {
        const arr = store[key] ? JSON.parse(store[key]) : [];
        arr.push(val);
        store[key] = JSON.stringify(arr);
        return Promise.resolve(arr.length);
      }),
      expire: jest.fn((key: string, ttl: number) => Promise.resolve(1)),
    };

    dbMock = {
      query: jest.fn((sql: string, params: any[]) => {
        if (sql.includes('SELECT') || sql.includes('INSERT')) {
          return Promise.resolve({ rows: [{ id: 1, email: params[0] }] });
        }
        return Promise.resolve({ rows: [] });
      }),
    };

    mailMock = {
      sendOtpEmail: jest.fn(() => Promise.resolve(true)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MemoryService,
          useValue: { getRedisClient: () => redisMock },
        },
        {
          provide: DatabaseService,
          useValue: dbMock,
        },
        {
          provide: MailService,
          useValue: mailMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should generate and send OTP successfully', async () => {
    const res = await service.sendOtp('user@gmail.com');
    expect(res.success).toBe(true);
    expect(res.expiresInSeconds).toBe(300);
    expect(mailMock.sendOtpEmail).toHaveBeenCalledWith('user@gmail.com', expect.any(String));
  });

  it('should enforce max 3 OTP requests within 20 minutes', async () => {
    await service.sendOtp('user@gmail.com');
    await service.sendOtp('user@gmail.com');
    await service.sendOtp('user@gmail.com');

    await expect(service.sendOtp('user@gmail.com')).rejects.toThrow(
      new HttpException('OTP request limit exceeded. Maximum 3 OTP requests allowed every 20 minutes.', HttpStatus.TOO_MANY_REQUESTS)
    );
  });

  it('should enforce 10-minute lockout after 3 failed verification attempts', async () => {
    await service.sendOtp('user@gmail.com');

    await expect(service.verifyOtp('user@gmail.com', '999999')).rejects.toThrow();
    await expect(service.verifyOtp('user@gmail.com', '999999')).rejects.toThrow();
    
    // 3rd failed attempt triggers lockout
    await expect(service.verifyOtp('user@gmail.com', '999999')).rejects.toThrow(
      new HttpException('Too many failed attempts. Account temporarily locked for 10 minutes.', HttpStatus.TOO_MANY_REQUESTS)
    );

    // Subsequent OTP request during lockout must also be rejected
    await expect(service.sendOtp('user@gmail.com')).rejects.toThrow(
      new HttpException('Too many failed attempts. Account temporarily locked for 10 minutes.', HttpStatus.TOO_MANY_REQUESTS)
    );
  });

  it('should successfully verify correct OTP and return user session', async () => {
    await service.sendOtp('user@gmail.com');
    const otpCode = mailMock.sendOtpEmail.mock.calls[0][1];

    const res = await service.verifyOtp('user@gmail.com', otpCode);
    expect(res.success).toBe(true);
    expect(res.user.email).toBe('user@gmail.com');
    expect(res.token).toBeDefined();
  });
});
