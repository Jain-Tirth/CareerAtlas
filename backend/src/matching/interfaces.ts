import { UserProfile } from '../profile/profile.service';
import { JobRequirements } from '../intelligence/job-intelligence.service';
import { Job } from '../discovery/discovery.service';

export interface SkillScore {
  overlapSkills: string[];
  missingSkills: string[];
  score: number; // 0 to 100
}

export interface SemanticScore {
  score: number; // 0 to 100
}

export interface ExperienceScore {
  requiredYears: number;
  candidateYears: number;
  score: number; // 0 to 100
}

export interface EducationScore {
  score: number; // 0 to 100
}

export interface EvidenceCard {
  description: string;
  type: 'ADDITIVE' | 'MULTIPLIER' | 'SUBTRACTIVE';
  val: number; // Score component (0-100), factor (0-1), or deduction
}

export interface AnalyzerOutput {
  cards: EvidenceCard[];
  confidence: number; // 0.0 to 1.0 representing analyzer certainty
}

export interface EvidenceAnalyzer {
  name: string;
  analyze(profile: UserProfile, reqs: JobRequirements, job: Job, context?: any): AnalyzerOutput;
}

export interface RankedJob {
  job: Job;
  finalScore: number;
  skillScore: number;
  semanticScore: number;
  experienceScore: number;
  educationScore: number;
  reasoning: string;

  // Explainability outputs
  overallScore: number;
  requiredSkillScore: number;
  preferredSkillScore: number;
  domainScore: number;
  locationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  eligible: boolean;

  // Compatibility fields
  eligibility: string;
  familyScore: number;
  subFamilyScore: number;

  // Confidence indicators
  confidenceScore: number;
  confidenceFactors: {
    positive: string[];
    negative: string[];
  };
}
