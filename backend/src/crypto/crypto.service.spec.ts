import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => null), // Fallback to transient keys
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    service.onModuleInit();
  });

  it('should be defined and initialize RSA key pair', () => {
    expect(service).toBeDefined();
    expect(service.getPublicKeyPem()).toContain('-----BEGIN PUBLIC KEY-----');
  });

  it('should encrypt and decrypt payload successfully using AES-GCM and RSA-OAEP', () => {
    const testData = {
      userEmail: 'candidate@example.com',
      sensitiveKey: 'secret_jwt_token_123',
      timestamp: Date.now(),
    };

    const encrypted = service.encryptPayload(testData);

    expect(encrypted.encryptedKey).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();

    const decrypted = service.decryptPayload(encrypted);

    expect(decrypted).toEqual(testData);
  });

  it('should support string payloads as well as objects', () => {
    const text = 'Hello CareerAtlas End-to-End Encryption!';
    const encrypted = service.encryptPayload(text);
    const decrypted = service.decryptPayload<string>(encrypted);

    expect(decrypted).toBe(text);
  });

  it('should encrypt and decrypt data at rest', () => {
    const dbRecord = { id: 42, role: 'Software Engineer', salary: 150000 };
    const serialized = service.encryptAtRest(dbRecord);

    expect(typeof serialized).toBe('string');

    const decrypted = service.decryptAtRest(serialized);
    expect(decrypted).toEqual(dbRecord);
  });

  it('should throw an error if auth tag or ciphertext is tampered with', () => {
    const testData = { msg: 'tamper_test' };
    const encrypted = service.encryptPayload(testData);

    // Tamper ciphertext
    const corruptedPayload = {
      ...encrypted,
      ciphertext: Buffer.from('corrupted_data_string').toString('base64'),
    };

    expect(() => service.decryptPayload(corruptedPayload)).toThrow();
  });
});
