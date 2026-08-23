import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoService } from './crypto.service';
import { CryptoInterceptor } from './crypto.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CryptoService, CryptoInterceptor],
  exports: [CryptoService, CryptoInterceptor],
})
export class CryptoModule {}
