import { UserProfile } from '../../profile/profile.service';
import { JobRequirements } from '../../intelligence/job-intelligence.service';
import { Job } from '../../discovery/discovery.service';
import { EvidenceCard, EvidenceAnalyzer, AnalyzerOutput } from '../interfaces';
import { DEFAULT_MATCHING_CONFIG } from '../constants';

export class LogisticsAnalyzer implements EvidenceAnalyzer {
  name = 'Logistics';

  constructor(private readonly service: any) {}

  analyze(profile: UserProfile, reqs: JobRequirements, job: Job, context?: any): AnalyzerOutput {
    const config = context?.config || DEFAULT_MATCHING_CONFIG;
    const cards: EvidenceCard[] = [];
    const requiredSkills = reqs.requiredSkills || [];
    const criticalSkills = reqs.criticalSkills || [];

    // Description Length check
    if (!job.description || job.description.trim().length < 150) {
      cards.push({
        description: `Short job description penalty.`,
        type: 'SUBTRACTIVE',
        val: config.penalties.shortDescription
      });
    }

    // Critical skills check
    if (criticalSkills.length > 0) {
      const criticalResult = this.service.calculateSkillScoreWithTransferability(profile.skills, criticalSkills, config);
      if (criticalResult.score === 0) {
        cards.push({
          description: `Missing critical skill set: ${criticalResult.missing.join(', ')}`,
          type: 'SUBTRACTIVE',
          val: config.penalties.criticalSkillMismatch
        });
      }
    }

    // Required skills low match check
    if (requiredSkills.length > 0) {
      const reqResult = this.service.calculateSkillScoreWithTransferability(profile.skills, requiredSkills, config);
      if (reqResult.score < 20) {
        cards.push({
          description: `Low required skills match penalty (${reqResult.score}%).`,
          type: 'SUBTRACTIVE',
          val: config.penalties.requiredSkillLowMatch
        });
      }
    }

    // Location / Remote Match
    const candidateLocations = (profile.preferences.locations || [])
      .map(loc => loc.trim().toLowerCase())
      .filter(Boolean);
    const isCandidateOpenToRemote = !!profile.preferences.remote;
    const jobLocLower = (reqs.location || '').toLowerCase();
    const isJobRemote = !!reqs.remoteAllowed || jobLocLower.includes('remote') || (job.description || '').toLowerCase().includes('remote');

    let locationMatch = true;
    if (candidateLocations.length > 0) {
      const normJobLoc = this.service.normalizeLocation(jobLocLower);
      const hasPhysicalMatch = candidateLocations.some(prefLoc => {
        const normPrefLoc = this.service.normalizeLocation(prefLoc);
        return normJobLoc.includes(normPrefLoc) || normPrefLoc.includes(normJobLoc);
      });

      if (!hasPhysicalMatch) {
        if (isJobRemote && isCandidateOpenToRemote) {
          const isCandidateInIndia = candidateLocations.some(loc => 
            loc.includes('india') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('ahmedabad') || loc.includes('noida') || loc.includes('delhi') || loc.includes('mumbai') || loc.includes('pune')
          );
          const isCandidateInCanada = candidateLocations.some(loc => 
            loc.includes('canada') || loc.includes('ontario') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('bc') || loc.includes('alberta')
          );
          const isCandidateInUS = candidateLocations.some(loc => 
            loc.includes('usa') || loc.includes('united states') || loc.includes('california') || loc.includes('new york') || loc.includes('texas') || loc.includes('sf') || loc.includes('chicago')
          );

          if (isCandidateInIndia) {
            if (jobLocLower.includes('usa') || jobLocLower.includes('united states') || jobLocLower.includes('canada') || jobLocLower.includes('uk') || jobLocLower.includes('united kingdom') || jobLocLower.includes('europe') || jobLocLower.includes('latam')) {
              locationMatch = false;
            }
          } else if (isCandidateInCanada) {
            if (jobLocLower.includes('usa') || jobLocLower.includes('united states') || jobLocLower.includes('india') || jobLocLower.includes('uk') || jobLocLower.includes('united kingdom') || jobLocLower.includes('europe')) {
              locationMatch = false;
            }
          } else if (isCandidateInUS) {
            if (jobLocLower.includes('india') || jobLocLower.includes('canada') || jobLocLower.includes('uk') || jobLocLower.includes('united kingdom') || jobLocLower.includes('europe')) {
              locationMatch = false;
            }
          }
        } else {
          locationMatch = false;
        }
      }
    } else {
      if (!isCandidateOpenToRemote && isJobRemote) {
        locationMatch = false;
      }
    }

    if (!locationMatch) {
      cards.push({
        description: `Location mismatch: Candidate in (${candidateLocations.join(', ') || 'N/A'}), Job in (${reqs.location || 'N/A'})`,
        type: 'SUBTRACTIVE',
        val: config.penalties.locationMismatch
      });
    }

    // Employment type check
    let employmentMatch = true;
    if (profile.preferences.employmentTypes && profile.preferences.employmentTypes.length > 0) {
      const jobEmpLower = reqs.employmentType.toLowerCase();
      employmentMatch = profile.preferences.employmentTypes.some(type => 
        jobEmpLower.includes(type.toLowerCase()) || type.toLowerCase().includes(jobEmpLower)
      );
    }

    if (!employmentMatch) {
      cards.push({
        description: `Employment type mismatch: Job requires ${reqs.employmentType}`,
        type: 'SUBTRACTIVE',
        val: config.penalties.employmentMismatch
      });
    }

    // Determine confidence based on explicit preferences presence
    const hasExplicitPref = candidateLocations.length > 0;
    const confidence = hasExplicitPref ? config.confidence.logistics.explicitPrefMatch : config.confidence.logistics.ambiguousPref;

    return { cards, confidence };
  }
}
