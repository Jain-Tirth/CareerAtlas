import { UserProfile } from '../../profile/profile.service';
import { JobRequirements } from '../../intelligence/job-intelligence.service';
import { Job } from '../../discovery/discovery.service';
import { EvidenceCard, EvidenceAnalyzer, AnalyzerOutput } from '../interfaces';
import { DEFAULT_MATCHING_CONFIG } from '../constants';

export class SemanticAnalyzer implements EvidenceAnalyzer {
  name = 'Semantic';

  analyze(profile: UserProfile, reqs: JobRequirements, job: Job, context?: any): AnalyzerOutput {
    const config = context?.config || DEFAULT_MATCHING_CONFIG;
    const similarity = context?.similarity || 0.5;
    
    const cards: EvidenceCard[] = [{
      description: `Dense vector semantic match similarity: ${Math.round(similarity * 100)}%`,
      type: 'ADDITIVE',
      val: Math.round(similarity * 30) // max 30 points
    }];

    // Compute ProfileMatchQuality (0.0 to 1.0)
    let profileMatchQuality = 0;
    if (profile.preferredRoles && profile.preferredRoles.length > 0) profileMatchQuality += 0.4;
    if (profile.skills && profile.skills.length > 0) profileMatchQuality += 0.4;
    if (profile.education && profile.education.length > 0) profileMatchQuality += 0.2;

    // Calculate semantic confidence using config weights
    const semConf = config.confidence.semantic;
    const confidence = (semConf.similarityWeight * similarity) + (semConf.profileMatchWeight * profileMatchQuality);

    return { cards, confidence };
  }
}
