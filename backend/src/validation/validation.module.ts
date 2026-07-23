import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { MemoryModule } from '../memory/memory.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [MemoryModule, EmbeddingsModule],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
