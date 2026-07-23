  import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
  import { DatabaseService } from '../vector-store/database.service';
  import { Job } from '../discovery/discovery.service';
  import { QdrantService } from '../vector-store/qdrant.service';
  import { EmbeddingsService } from '../embeddings/embeddings.service';
  
  @Injectable()
  export class ValidationService implements OnModuleInit {
    private readonly logger = new Logger(ValidationService.name);
    private readonly apiKey = process.env.TINYFISH_API_KEY;
    private client: any = null;

    async onModuleInit() {
      try {
        const { TinyFish } = await import('@tiny-fish/sdk');
        this.client = new TinyFish({ apiKey: this.apiKey });
        this.logger.log('[VALIDATION] TinyFish SDK client loaded dynamically.');
      } catch (err: any) {
        this.logger.error(`[VALIDATION] Failed to dynamically load TinyFish SDK: ${err.message}`);
      }
    }

    constructor(
      private readonly db: DatabaseService,
      private readonly qdrantService: QdrantService,
      private readonly embeddingsService: EmbeddingsService,
    ) { }


    async isJobInUserResults(userId: number, jobId: string): Promise<boolean> {
      try {
        const res = await this.db.query(
          'SELECT id FROM results WHERE user_id = $1 AND job_id = $2',
          [userId, jobId]
        );
        return res.rows.length > 0;
      } catch (err) {
        this.logger.error(`[VALIDATION] DB check for user results duplicate failed: ${err.message}`);
        return false;
      }
    }

    async isJobInQdrant(jobId: string): Promise<boolean> {
      try {
        const uuid = QdrantService.stringToUuid(jobId);
        const res = await this.qdrantService.getClient().retrieve('job_embeddings', {
          ids: [uuid],
          with_payload: true,
          with_vector: false,
        });
        if (res.length === 0) return false;
        
        const payload = res[0].payload as any;
        if (!payload) return false;
        
        // Skip only if extraction status was SUCCESS
        return payload.extractionStatus === 'SUCCESS';
      } catch (err) {
        this.logger.error(`[VALIDATION] Qdrant check for job embedding existence failed: ${err.message}`);
        return false;
      }
    }

    async validateSingleJob(job: Job, searchTerm: string, profile: any, userId: number): Promise<{ valid: boolean; reason?: string; bypassed?: boolean }> {
      try {
        // 1. Check if the user has already seen/notified this job
        const isAlreadyInUserResult = await this.isJobInUserResults(userId, job.jobId);
        if (isAlreadyInUserResult) {
          return { valid: false, reason: 'Duplicate (Already matched to this user)' };
        }

        // 2. Check Expiry
        const isExpired = await this.isExpired(job);
        if (isExpired) {
          return { valid: false, reason: 'Expired' };
        }

        // 3. Check Broken URL
        const isUrlActive = await this.isUrlActive(job.applyUrl);
        if (!isUrlActive) {
          return { valid: false, reason: 'Broken Link' };
        }

        // 4. Check if job already has vector embeddings in Qdrant
        const inQdrant = await this.isJobInQdrant(job.jobId);

        return { valid: true, bypassed: inQdrant };
      } catch (err) {
        this.logger.error(`[VALIDATION] Exception validating job "${job.title}": ${err.message}`);
        return { valid: false, reason: `Error: ${err.message}` };
      }
    }

    private async isExpired(job: Job): Promise<boolean> {
      // JDs with clear "expired/closed" language in body
      const expiredKeywords = /\b(hiring has ended|no longer accepting applications|this job has expired|role is closed)\b/i;
      if (job.description && expiredKeywords.test(job.description)) {
        return true;
      }

      if (!this.client) {
        this.logger.warn(`[VALIDATION] TinyFish client not initialized. Skipping deep content check for: ${job.applyUrl}`);
        return false;
      }

      try {
        const content = await this.client.fetch.getContents({ urls: [job.applyUrl] });

        // Check for 404 / HTTP error results
        if (content.errors && content.errors.length > 0) {
          const has404 = content.errors.some(err => 
            err.error.includes('404') || 
            err.error.toLowerCase().includes('not found')
          );
          if (has404) {
            this.logger.log(`[VALIDATION] Expiry check: 404 returned for ${job.applyUrl}`);
            return true;
          }
        }

        // Check for empty results / missing content
        if (!content.results || content.results.length === 0) {
          this.logger.log(`[VALIDATION] Expiry check: No content returned for ${job.applyUrl}`);
          return true;
        }

        const result = content.results[0];
        if (!result || typeof result.text !== 'string' || result.text.trim().length === 0) {
          this.logger.log(`[VALIDATION] Expiry check: Text content is empty or invalid for ${job.applyUrl}`);
          return true;
        }

        // Check fetched full text for expiry keywords
        if (expiredKeywords.test(result.text)) {
          this.logger.log(`[VALIDATION] Expiry check: Expired keywords found in fetched text for ${job.applyUrl}`);
          return true;
        }
      } catch (err: any) {
        this.logger.error(`[VALIDATION] Expiry check failed for ${job.applyUrl}: ${err.message}`);
      }

      return false;
    }

    private async isUrlActive(url: string): Promise<boolean> {
      if (!url || !url.startsWith('http')) {
        return false;
      }

      // Specially bypass URL active check for major job platforms that aggressively block simple HTTP requests
      const urlLower = url.toLowerCase();
      if (
        urlLower.includes('linkedin.com') ||
        urlLower.includes('wellfound.com') ||
        urlLower.includes('ycombinator.com') ||
        urlLower.includes('glassdoor') ||
        urlLower.includes('indeed.com') ||
        urlLower.includes('lever.co') ||
        urlLower.includes('greenhouse.io') ||
        urlLower.includes('ashbyhq.com') ||
        urlLower.includes('instahyre.com/job') ||
        urlLower.includes('cutshort.io/job') ||
        urlLower.includes('naukri.com/job-listings') ||
        urlLower.includes('workable.com')
      ) {
        return true;
      }

      try {
        // Use AbortController to set a strict 2.5-second timeout so URL checking doesn't hang the loop
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        clearTimeout(timeoutId);

        if (response.status === 404 || response.status === 410) {
          return false;
        }
        return true;
      } catch (err: any) {
        // If HEAD fails, fallback to GET with a 2-second timeout as some sites block HEAD requests
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
          });

          clearTimeout(timeoutId);
          if (response.status === 404 || response.status === 410) {
            return false;
          }
          return true;
        } catch (getErr: any) {
          const errMsg = getErr.message || '';
          if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo') || errMsg.includes('dns')) {
            this.logger.warn(`[VALIDATION] URL connection check failed for: ${url} (${getErr.message})`);
            return false;
          }
          return true;
        }
      }
    }
  }
