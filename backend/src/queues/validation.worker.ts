import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job as BullJob } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ValidationService } from '../validation/validation.service';
import { ProfileService } from '../profile/profile.service';
import { PipelineCoordinatorService } from './pipeline-coordinator.service';
import { Job } from '../discovery/discovery.service';

interface ValidationJobPayload {
  runId: string;
  discoveryPayload: {
    runId: string;
    userId: number;
    searchTerms: string[];
    activeTermIndex: number;
    locationSearch: string;
    limit: number;
    currentCycle: number;
    maxCycles: number;
    page: number;
    accumulatedMatches: any[];
  };
  job?: Job;
  jobs?: Job[];
}

@Processor('job-validation', { concurrency: 10 })
export class ValidationWorker extends WorkerHost {
  private readonly logger = new Logger(ValidationWorker.name);

  constructor(
    private readonly validationService: ValidationService,
    private readonly profileService: ProfileService,
    private readonly coordinator: PipelineCoordinatorService,
    @InjectQueue('job-scraping') private readonly scrapingQueue: Queue,
    @InjectQueue('job-matching') private readonly matchingQueue: Queue,
  ) {
    super();
  }

  async process(bullJob: BullJob<ValidationJobPayload>): Promise<any> {
    const validationStart = Date.now();
    const { runId, discoveryPayload, job, jobs } = bullJob.data;

    const jobList = jobs && jobs.length > 0 ? jobs : (job ? [job] : []);
    if (jobList.length === 0) {
      this.logger.warn(`[VALIDATION-WORKER] Received empty job payload for run ${runId}`);
      return { valid: false, reason: 'No jobs provided' };
    }

    try {
      // Fetch user profile for location/remote checks
      const profile = await this.profileService.getProfileById(discoveryPayload.userId);
      const activeTerm = discoveryPayload.searchTerms[discoveryPayload.activeTermIndex] || '';

      // Execute high-performance bulk validation
      const validationResultsMap = await this.validationService.validateBatch(
        jobList,
        activeTerm,
        profile,
        discoveryPayload.userId
      );
      const valDurationMs = Date.now() - validationStart;

      this.logger.log(`[LATENCY] [job-validation] Batch validation completed in ${valDurationMs}ms for ${jobList.length} jobs in run ${runId}`);

      for (const currentJob of jobList) {
        const result = validationResultsMap.get(currentJob.jobId) || { valid: false, reason: 'Validation error' };

        if (!result.valid) {
          this.logger.log(`[VALIDATION-WORKER] Job discarded: "${currentJob.title}" at "${currentJob.company}" (${result.reason})`);

          // Decrement remaining jobs counter
          const isBatchComplete = await this.coordinator.decrementRemainingJobs(runId);
          if (isBatchComplete) {
            this.logger.log(`[VALIDATION-WORKER] Batch complete after discard. Triggering matching...`);
            await this.matchingQueue.add('evaluate', discoveryPayload);
          }
        } else if (result.bypassed) {
          this.logger.log(`[VALIDATION-WORKER] Job bypassed (Qdrant hit): "${currentJob.title}" at "${currentJob.company}"`);
          await this.coordinator.addLog(runId, `Bypassed Intelligence & Embedding for "${currentJob.title}" at ${currentJob.company} (already indexed).`);

          const isBatchComplete = await this.coordinator.decrementRemainingJobs(runId);
          if (isBatchComplete) {
            this.logger.log(`[VALIDATION-WORKER] Batch complete after bypass. Triggering matching...`);
            await this.matchingQueue.add('evaluate', discoveryPayload);
          }
        } else {
          this.logger.log(`[VALIDATION-WORKER] Job approved: "${currentJob.title}" at "${currentJob.company}". Sending to Scraping Enrichment...`);
          await this.scrapingQueue.add('scrape-job', {
            runId,
            discoveryPayload,
            job: currentJob,
          });
        }
      }

      return { processedCount: jobList.length, durationMs: valDurationMs };
    } catch (err: any) {
      const valDurationMs = Date.now() - validationStart;
      this.logger.error(`[LATENCY-ERROR] [job-validation] Exception in validation worker after ${valDurationMs}ms: ${err.message}`);

      // Safely decrement remaining counter for all jobs in batch on error
      for (const _ of jobList) {
        const isBatchComplete = await this.coordinator.decrementRemainingJobs(runId);
        if (isBatchComplete) {
          await this.matchingQueue.add('evaluate', discoveryPayload);
        }
      }
      throw err;
    }
  }
}
