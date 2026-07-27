import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [EmbeddingsModule, IntelligenceModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
