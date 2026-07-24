import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private extractor: any = null;

  async onModuleInit() {
    this.logger.log('[EMBEDDINGS] Initializing embedding model via fastembed (BGE Small)...');
    try {
      const { FlagEmbedding, EmbeddingModel } = await import('fastembed');
      this.extractor = await FlagEmbedding.init({
        model: EmbeddingModel.BGESmallENV15
      });
      this.logger.log('[EMBEDDINGS] fastembed model loaded successfully.');
    } catch (err: any) {
      this.logger.warn(
        `[EMBEDDINGS] Failed to load fastembed model: ${err.message}. Using deterministic vector fallback.`
      );
    }
  }

  /**
   * Generates a 384-dimensional embedding vector for the given text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embedStart = Date.now();
    if (!text || text.trim().length === 0) {
      return new Array(384).fill(0);
    }

    if (this.extractor) {
      try {
        const embeddings = this.extractor.embed([text]);
        for await (const batch of embeddings) {
          if (batch && batch.length > 0) {
            const genMs = Date.now() - embedStart;
            this.logger.log(`[LATENCY] [embeddings] Fastembed vector generation completed in ${genMs}ms`);
            return Array.from(batch[0]) as number[];
          }
        }
      } catch (err: any) {
        this.logger.error(`[EMBEDDINGS] fastembed embedding generation failed: ${err.message}`);
      }
    }

    this.logger.warn(`[EMBEDDINGS] Fastembed unavailable or failed. Generating deterministic 384-dim vector.`);
    const fallbackVector = this.generateDeterministicVector(text, 384);
    const genMs = Date.now() - embedStart;
    this.logger.log(`[LATENCY] [embeddings] Deterministic fallback vector generation completed in ${genMs}ms`);
    return fallbackVector;
  }

  private generateDeterministicVector(text: string, dimensions = 384): number[] {
    const vector = new Array(dimensions).fill(0);
    const cleaned = text.toLowerCase().trim();
    this.logger.log("[EMBEDDINGS]: Generating deterministic vector");
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      const index = (charCode + i * 31) % dimensions;
      vector[index] += 1.0;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => (magnitude > 0 ? val / magnitude : 1 / Math.sqrt(dimensions)));
  }
}
