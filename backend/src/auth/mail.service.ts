import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tls from 'tls';

@Injectable()
export class MailService {
  protected readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpEmail(recipientEmail: string, otp: string): Promise<boolean> {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword || gmailAppPassword === 'your_google_app_password') {
      this.logger.log(`\n========================================\n[DEV GMAIL OTP] Recipient: ${recipientEmail} | Code: ${otp}\n========================================\n`);
      return true;
    }

    const subject = 'Your CareerAtlas Verification Code';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="color: #3b82f6; margin-bottom: 8px; font-size: 20px;">CareerAtlas Verification Code</h2>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.5;">Use the verification code below to complete your login. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="background-color: #1e293b; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #334155;">
          <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #60a5fa; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this code, please ignore this email.</p>
      </div>
    `;

    const rawMessage = [
      `From: "CareerAtlas Auth" <${gmailUser}>`,
      `To: <${recipientEmail}>`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      htmlBody,
      `.`
    ].join('\r\n');

    return new Promise((resolve) => {
      const client = tls.connect({ host: 'smtp.gmail.com', port: 465, rejectUnauthorized: false }, () => {
        // Connected securely to Google SMTP
      });

      let step = 0;
      client.on('data', (data) => {
        const response = data.toString();
        if (step === 0 && response.startsWith('220')) {
          client.write('EHLO localhost\r\n');
          step = 1;
        } else if (step === 1 && response.startsWith('250')) {
          client.write('AUTH LOGIN\r\n');
          step = 2;
        } else if (step === 2 && response.startsWith('334')) {
          client.write(Buffer.from(gmailUser).toString('base64') + '\r\n');
          step = 3;
        } else if (step === 3 && response.startsWith('334')) {
          client.write(Buffer.from(gmailAppPassword).toString('base64') + '\r\n');
          step = 4;
        } else if (step === 4 && response.startsWith('235')) {
          client.write(`MAIL FROM:<${gmailUser}>\r\n`);
          step = 5;
        } else if (step === 5 && response.startsWith('250')) {
          client.write(`RCPT TO:<${recipientEmail}>\r\n`);
          step = 6;
        } else if (step === 6 && response.startsWith('250')) {
          client.write('DATA\r\n');
          step = 7;
        } else if (step === 7 && response.startsWith('354')) {
          client.write(rawMessage + '\r\n');
          step = 8;
        } else if (step === 8 && response.startsWith('250')) {
          client.write('QUIT\r\n');
          this.logger.log(`[MAIL] Sent OTP email via native Google SMTP to ${recipientEmail}`);
          client.end();
          resolve(true);
        } else if (response.startsWith('5')) {
          this.logger.error(`[MAIL] Google SMTP error: ${response.trim()}`);
          client.end();
          resolve(false);
        }
      });

      client.on('error', (err) => {
        this.logger.error(`[MAIL] Google SMTP socket error: ${err.message}`);
        resolve(false);
      });
    });
  }
}
