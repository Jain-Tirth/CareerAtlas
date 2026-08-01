import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GMAIL_USER') return null;
              if (key === 'GMAIL_APP_PASSWORD') return null;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should format and return true when logging in dev fallback mode', async () => {
    const spy = jest.spyOn(service['logger'], 'log');
    const result = await service.sendOtpEmail('candidate@gmail.com', '123456');
    expect(result).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
