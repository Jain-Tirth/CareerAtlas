import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { MemoryModule } from '../memory/memory.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [ConfigModule, MemoryModule, VectorStoreModule],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
