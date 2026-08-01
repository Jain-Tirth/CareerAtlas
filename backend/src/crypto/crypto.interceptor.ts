import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService, EncryptedPayload } from './crypto.service';
import { Request, Response } from 'express';

@Injectable()
export class CryptoInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CryptoInterceptor.name);

  constructor(private readonly cryptoService: CryptoService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // 1. Process Incoming In-Transit Encrypted Requests
    const encryptedKey = req.headers['x-encrypted-key'] as string;
    const iv = req.headers['x-crypto-iv'] as string;
    const tag = req.headers['x-crypto-tag'] as string;

    if (encryptedKey && iv && tag && req.body) {
      try {
        const ciphertext = typeof req.body === 'object' && req.body.ciphertext ? req.body.ciphertext : req.body;
        const payload: EncryptedPayload = {
          encryptedKey,
          iv,
          tag,
          ciphertext: typeof ciphertext === 'string' ? ciphertext : JSON.stringify(ciphertext),
        };

        const decryptedData = this.cryptoService.decryptPayload(payload);
        req.body = decryptedData;
        this.logger.log('[CRYPTO-INTERCEPTOR] Successfully decrypted incoming in-transit request.');
      } catch (err: any) {
        this.logger.error(`[CRYPTO-INTERCEPTOR] Decryption of incoming request failed: ${err.message}`);
        throw err;
      }
    }

    // 2. Process Outgoing In-Transit Encrypted Responses
    const shouldEncryptResponse =
      req.headers['x-encrypt-response'] === 'true' || Boolean(encryptedKey);

    return next.handle().pipe(
      map((data) => {
        if (!shouldEncryptResponse || data === undefined || data === null) {
          return data;
        }

        try {
          const encrypted = this.cryptoService.encryptPayload(data);
          
          // Set crypto headers for the client
          res.setHeader('x-encrypted-key', encrypted.encryptedKey);
          res.setHeader('x-crypto-iv', encrypted.iv);
          res.setHeader('x-crypto-tag', encrypted.tag);

          this.logger.log('[CRYPTO-INTERCEPTOR] Successfully encrypted outgoing response.');
          return { ciphertext: encrypted.ciphertext };
        } catch (err: any) {
          this.logger.error(`[CRYPTO-INTERCEPTOR] Encryption of outgoing response failed: ${err.message}`);
          return data;
        }
      })
    );
  }
}
