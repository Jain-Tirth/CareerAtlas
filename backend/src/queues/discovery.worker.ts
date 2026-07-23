import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job as BullJob } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AtsPortalsAgent } from '../discovery/ats-portals.agent';
import { StartupBoardsAgent } from '../discovery/startup-boards.agent';
import { IndiaFocusedAgent } from '../discovery/india-focused.agent';
import { LinkedInAgent } from '../discovery/linkedin.agent';
import { PipelineCoordinatorService } from './pipeline-coordinator.service';
import { DatabaseService } from '../vector-store/database.service';
import { Job } from '../discovery/discovery.service';

interface DiscoveryJobPayload {
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
}

@Processor('job-discovery', { concurrency: 2 }) // Concurrency = 2 to prevent rate bans on scrapers
export class DiscoveryWorker extends WorkerHost {
  private readonly logger = new Logger(DiscoveryWorker.name);

  constructor(
    private readonly atsPortalsAgent: AtsPortalsAgent,
    private readonly startupBoardsAgent: StartupBoardsAgent,
    private readonly indiaFocusedAgent: IndiaFocusedAgent,
    private readonly linkedinAgent: LinkedInAgent,
    private readonly coordinator: PipelineCoordinatorService,
    private readonly db: DatabaseService,
    @InjectQueue('job-validation') private readonly validationQueue: Queue,
    @InjectQueue('job-matching') private readonly matchingQueue: Queue,
  ) {
    super();
  }

  async process(job: BullJob<DiscoveryJobPayload>): Promise<any> {
    const { runId, userId, searchTerms, activeTermIndex, locationSearch, page, currentCycle } = job.data;
    const searchTerm = searchTerms[activeTermIndex] || '';
    
    this.logger.log(`[DISCOVERY-WORKER] Starting run ${runId} cycle ${currentCycle} for term "${searchTerm}"...`);
    await this.coordinator.updateStep(runId, 'step-2', 'running');
    await this.coordinator.addLog(runId, `[Cycle ${currentCycle}] Crawling for term "${searchTerm}" (Page ${page})...`);

    // Fetch user's experience years from the database
    let experienceYears: number | undefined = undefined;
    try {
      const prefRes = await this.db.query('SELECT experience_years FROM user_preferences WHERE user_id = $1', [userId]);
      if (prefRes.rows.length > 0 && prefRes.rows[0].experience_years !== null) {
        experienceYears = parseFloat(prefRes.rows[0].experience_years);
      }
    } catch (dbErr) {
      this.logger.warn(`[DISCOVERY-WORKER] Could not fetch user experience_years: ${dbErr.message}`);
    }

    try {
      // Helper to prevent any single scraper agent from hanging the discovery pipeline
      const withTimeout = async <T>(agentPromise: Promise<T>, agentName: string, timeoutMs = 15000, fallback: T): Promise<T> => {
        return Promise.race([
          agentPromise,
          new Promise<T>((resolve) => {
            setTimeout(() => {
              this.logger.warn(`[DISCOVERY-WORKER] Agent ${agentName} timed out after ${timeoutMs}ms. Continuing with remaining agents.`);
              resolve(fallback);
            }, timeoutMs);
          }),
        ]);
      };

      // Run discovery agents in parallel with 15-second individual safeguards
      const [atsJobs, startupJobs, indiaJobs, linkedinJobs] = await Promise.all([
        withTimeout(this.atsPortalsAgent.findJobs(searchTerm, locationSearch, page, currentCycle, experienceYears), 'ATS_PORTALS', 15000, []),
        withTimeout(this.startupBoardsAgent.findJobs(searchTerm, locationSearch, page, currentCycle, experienceYears), 'STARTUP_BOARDS', 15000, []),
        withTimeout(this.indiaFocusedAgent.findJobs(searchTerm, locationSearch, page, currentCycle, experienceYears), 'INDIA_FOCUSED', 15000, []),
        withTimeout(this.linkedinAgent.findJobs(searchTerm, locationSearch, page, currentCycle, experienceYears), 'LINKEDIN', 15000, []),
      ]);

      const rawScrapedJobs = [...atsJobs, ...startupJobs, ...indiaJobs, ...linkedinJobs];
      
      // Deduplicate by jobId / applyUrl to prevent duplicate validation & scraping pipeline runs
      const uniqueJobsMap = new Map<string, Job>();
      for (const j of rawScrapedJobs) {
        const key = (j.applyUrl || j.jobId).trim().toLowerCase();
        if (!uniqueJobsMap.has(key)) {
          uniqueJobsMap.set(key, j);
        }
      }
      const uniqueScrapedJobs = Array.from(uniqueJobsMap.values());

      this.logger.log(`[DISCOVERY-WORKER] Ingested ${rawScrapedJobs.length} raw jobs (Unique: ${uniqueScrapedJobs.length}) for run ${runId}`);
      
      // Log the list of fetched jobs to Nest Logger (which captures them to DiscoveryWorker.log if DEBUG is true)
      if (uniqueScrapedJobs.length > 0) {
        this.logger.log(
          `[DISCOVERY-WORKER] Jobs fetched for search title "${searchTerm}" (Count: ${uniqueScrapedJobs.length}):\n` +
          uniqueScrapedJobs.map((j, idx) => `  ${idx + 1}. [Source: ${j.source}] "${j.title}" at "${j.company}" (URL: ${j.applyUrl || 'No URL'})`).join('\n')
        );
      }

      // If DEBUG is enabled, write a detailed and formatted summary to output/scraped_jobs.log
      if (process.env.DEBUG === 'true') {
        try {
          const cwd = process.cwd();
          let workspaceRoot = cwd;
          if (fs.existsSync(path.join(cwd, 'backend'))) {
            workspaceRoot = cwd;
          } else {
            const parent = path.resolve(cwd, '..');
            if (fs.existsSync(path.join(parent, 'backend'))) {
              workspaceRoot = parent;
            }
          }
          const outputDir = path.join(workspaceRoot, 'output');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const scraperLogFile = path.join(outputDir, 'scraped_jobs.log');
          const timestamp = new Date().toLocaleString();
          
          let logContent = `=========================================\n`;
          logContent += `Timestamp: ${timestamp}\n`;
          logContent += `Run ID: ${runId}\n`;
          logContent += `Search Title/Term: "${searchTerm}"\n`;
          logContent += `Location: "${locationSearch}"\n`;
          logContent += `Page: ${page}\n`;
          logContent += `Total Jobs Fetched: ${uniqueScrapedJobs.length}\n`;
          logContent += `-----------------------------------------\n`;
          
          if (uniqueScrapedJobs.length === 0) {
            logContent += `No jobs fetched for this search title.\n`;
          } else {
            uniqueScrapedJobs.forEach((j, idx) => {
              logContent += `${idx + 1}. [Source: ${j.source}] "${j.title}" at "${j.company}"\n`;
              logContent += `   URL: ${j.applyUrl || 'No URL'}\n`;
              if (j.description) {
                const snippet = j.description.length > 150 ? j.description.substring(0, 150) + '...' : j.description;
                logContent += `   Snippet: ${snippet.replace(/\r?\n/g, ' ')}\n`;
              }
            });
          }
          logContent += `=========================================\n\n`;
          
          fs.appendFileSync(scraperLogFile, logContent, 'utf8');
        } catch (err) {
          this.logger.error(`Failed to write scraped jobs to log file: ${err.message}`);
        }
      }

      await this.coordinator.addLog(runId, `[Cycle ${currentCycle}] Scraped ${uniqueScrapedJobs.length} raw jobs.`);
      await this.coordinator.updateStep(runId, 'step-2', 'success');

      if (uniqueScrapedJobs.length === 0) {
        this.logger.warn(`[DISCOVERY-WORKER] No raw jobs found in cycle ${currentCycle}. Triggering matching stage immediately.`);
        await this.coordinator.addLog(runId, `[Cycle ${currentCycle}] Warning: No jobs found. Proceeding to matching evaluation.`);
        
        // Enqueue matching job immediately since there are no child jobs to process
        await this.matchingQueue.add('evaluate', job.data);
        return { count: 0 };
      }

      // Initialize counter in coordinator
      await this.coordinator.setTotalJobs(runId, uniqueScrapedJobs.length);
      await this.coordinator.updateStep(runId, 'step-3', 'running');
      await this.coordinator.addLog(runId, `[Cycle ${currentCycle}] Validation starting for ${uniqueScrapedJobs.length} jobs...`);

      // Enqueue each job for validation
      for (const rawJob of uniqueScrapedJobs) {
        await this.validationQueue.add('validate-job', {
          runId,
          discoveryPayload: job.data,
          job: rawJob,
        });
      }

      return { count: uniqueScrapedJobs.length };
    } catch (err: any) {
      this.logger.error(`[DISCOVERY-WORKER] Failed to ingest jobs: ${err.message}`, err.stack);
      await this.coordinator.failRun(runId, `Discovery stage failed: ${err.message}`);
      throw err;
    }
  }
}
