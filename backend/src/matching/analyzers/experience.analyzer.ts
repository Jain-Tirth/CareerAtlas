import { UserProfile } from '../../profile/profile.service';
import { JobRequirements } from '../../intelligence/job-intelligence.service';
import { Job } from '../../discovery/discovery.service';
import { EvidenceCard, EvidenceAnalyzer, AnalyzerOutput } from '../interfaces';
import { DEFAULT_MATCHING_CONFIG } from '../constants';

export class ExperienceSeniorityAnalyzer implements EvidenceAnalyzer {
  name = 'ExperienceSeniority';

  analyze(profile: UserProfile, reqs: JobRequirements, job: Job, context?: any): AnalyzerOutput {
    const config = context?.config || DEFAULT_MATCHING_CONFIG;
    const cards: EvidenceCard[] = [];
    const candidateYears = profile.experienceYears || 0;
    
    let minYearsRequired = reqs.experienceRequired || 0;
    const titleLower = job.title.toLowerCase();
    const descLower = (job.description || '').toLowerCase();
    const textToScan = titleLower + ' ' + descLower;

    if (
      /\b(principal|architect|director|vp|head|vice president|ic5|ic6|l7|l8)\b/i.test(titleLower) ||
      /\b(career level - ic5|career level - ic6|level 7|level 8)\b/i.test(textToScan)
    ) {
      minYearsRequired = Math.max(minYearsRequired, 8);
    } else if (
      /\b(lead|manager|staff|engineering lead|tech lead|ic4|l6)\b/i.test(titleLower) ||
      /\b(career level - ic4|level 6)\b/i.test(textToScan)
    ) {
      minYearsRequired = Math.max(minYearsRequired, 6);
    } else if (
      /\b(senior|sr\b|sr\.|\biii\b|sde 3|sde iii|sde-3|sde-iii|developer 3|ic3|l5)\b/i.test(titleLower) ||
      /\b(career level - ic3|level 5)\b/i.test(textToScan)
    ) {
      minYearsRequired = Math.max(minYearsRequired, 5);
    } else if (
      /\b(mid|intermediate|sde 2|sde ii|sde-2|sde-ii|developer 2|ic2|l4)\b/i.test(titleLower) ||
      /\b(career level - ic2|level 4)\b/i.test(textToScan)
    ) {
      minYearsRequired = Math.max(minYearsRequired, 2);
    } else if (
      /\b(intern|internship|fresher|entry level|associate|graduate|trainee|sde 1|sde i|sde-1|sde-i|developer 1|ic1|l3)\b/i.test(titleLower) ||
      /\b(career level - ic1|level 3)\b/i.test(textToScan)
    ) {
      minYearsRequired = 0;
    }

    const yearsMatch = textToScan.match(/\b(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience\b/i);
    if (yearsMatch) {
      const explicitYears = parseInt(yearsMatch[1], 10);
      minYearsRequired = Math.max(minYearsRequired, explicitYears);
    }

    if (candidateYears >= minYearsRequired) {
      cards.push({
        description: `Candidate meets or exceeds experience requirements (${candidateYears}/${minYearsRequired} years).`,
        type: 'MULTIPLIER',
        val: 1.0
      });
    } else {
      const gap = minYearsRequired - candidateYears;
      const multiplier = Math.max(0.3, parseFloat((1.0 - gap * 0.10).toFixed(2)));
      cards.push({
        description: `Experience gap of ${gap} year(s) (Candidate: ${candidateYears} yrs, Required: ${minYearsRequired} yrs).`,
        type: 'MULTIPLIER',
        val: multiplier
      });
    }

    // Determine confidence based on presence of valid experience years
    const hasValidExperience = profile.experienceYears !== undefined && profile.experienceYears !== null && !isNaN(profile.experienceYears);
    const confidence = hasValidExperience ? config.confidence.experience.completeHistory : config.confidence.experience.missingHistoryDates;

    return { cards, confidence };
  }
}
