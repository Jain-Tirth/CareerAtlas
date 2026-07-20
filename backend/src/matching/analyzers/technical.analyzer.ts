import { UserProfile } from '../../profile/profile.service';
import { JobRequirements } from '../../intelligence/job-intelligence.service';
import { Job } from '../../discovery/discovery.service';
import { EvidenceCard, EvidenceAnalyzer, AnalyzerOutput } from '../interfaces';
import { DEFAULT_MATCHING_CONFIG } from '../constants';

export class TechnicalCompetenceAnalyzer implements EvidenceAnalyzer {
  name = 'TechnicalCompetence';

  constructor(private readonly service: any) {}

  analyze(profile: UserProfile, reqs: JobRequirements, job: Job, context?: any): AnalyzerOutput {
    const config = context?.config || DEFAULT_MATCHING_CONFIG;
    const techConf = config.confidence.technical;
    
    const cards: EvidenceCard[] = [];
    const requiredSkills = reqs.requiredSkills || [];
    const preferredSkills = reqs.preferredSkills || [];
    
    let reqSkillsConf = techConf.exactMatch;
    let prefSkillsConf = techConf.exactMatch;
    let projectConf = techConf.exactMatch;
    
    // Compute required skills match
    if (requiredSkills.length > 0) {
      const result = this.service.calculateSkillScoreWithTransferability(profile.skills, requiredSkills, config);
      cards.push({
        description: `Required skills match score: ${result.score}%`,
        type: 'ADDITIVE',
        val: Math.round(result.score * 0.40) // max 40 points
      });
      reqSkillsConf = result.confidence !== undefined ? result.confidence : techConf.exactMatch;
    } else {
      cards.push({
        description: `No required skills listed for this job.`,
        type: 'ADDITIVE',
        val: 0
      });
      reqSkillsConf = 0.0;
    }

    // Compute preferred skills match
    if (preferredSkills.length > 0) {
      const result = this.service.calculateSkillScoreWithTransferability(profile.skills, preferredSkills, config);
      cards.push({
        description: `Preferred skills match score: ${result.score}%`,
        type: 'ADDITIVE',
        val: Math.round(result.score * 0.10) // max 10 points
      });
      prefSkillsConf = result.confidence !== undefined ? result.confidence : techConf.exactMatch;
    } else {
      cards.push({
        description: `No preferred skills listed.`,
        type: 'ADDITIVE',
        val: 0
      });
      prefSkillsConf = 0.0;
    }

    // Domain Fit Match
    const userFamilySub = this.service.determineFamilyAndSubfamily(profile.preferredRoles[0] || '', profile.skills);
    const jobFamilySub = this.service.determineFamilyAndSubfamily(job.title, reqs.requiredSkills);
    const domainScore = this.service.calculateDomainScore(
      userFamilySub.family,
      userFamilySub.subfamily,
      jobFamilySub.family,
      jobFamilySub.subfamily
    );
    cards.push({
      description: `Domain alignment fit score: ${domainScore}%`,
      type: 'ADDITIVE',
      val: Math.round(domainScore * 0.10) // max 10 points
    });

    // Project Scanner Match
    const projectText = (profile.projects || []).join(' ').toLowerCase();
    let projectMatchCount = 0;
    const verifiedSkills: string[] = [];
    
    const uniqueSkills = new Set([...requiredSkills, ...preferredSkills]);
    for (const skill of uniqueSkills) {
      const normSkill = this.service.normalizeSkillName(skill);
      if (normSkill && projectText.includes(normSkill)) {
        projectMatchCount++;
        verifiedSkills.push(skill);
      }
    }
    
    const projectVal = Math.min(10, projectMatchCount * 2);
    if (projectVal > 0) {
      cards.push({
        description: `Verified practical project experience for: ${verifiedSkills.slice(0, 3).join(', ')}`,
        type: 'ADDITIVE',
        val: projectVal // max 10 points
      });
      projectConf = techConf.projectInferredMatch;
    }

    // Compute technical confidence as a weighted average
    const confidence = (reqSkillsConf * 0.6) + (prefSkillsConf * 0.2) + (projectConf * 0.2);

    return { cards, confidence };
  }
}
