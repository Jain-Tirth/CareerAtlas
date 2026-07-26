import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      sendOtp: jest.fn(() => Promise.resolve({ success: true, message: 'OTP sent', expiresInSeconds: 300 })),
      verifyOtp: jest.fn(() => Promise.resolve({ success: true, message: 'Success', user: { id: 1, email: 'test@example.com' }, token: 'mock_token' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call sendOtp on AuthService', async () => {
    const res = await controller.sendOtp({ email: 'test@example.com' });
    expect(authServiceMock.sendOtp).toHaveBeenCalledWith('test@example.com');
    expect(res.success).toBe(true);
  });

  it('should call verifyOtp on AuthService', async () => {
    const res = await controller.verifyOtp({ email: 'test@example.com', otp: '123456' });
    expect(authServiceMock.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
    expect(res.success).toBe(true);
  });
});
