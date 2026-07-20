export interface MatchingPolicy {
  minMatchScore: number;
  minSemanticSimilarity: number;
  useHardFilters: boolean;
  weights: {
    technical: number;
    experience: number;
    semantic: number;
    logistics: number;
  };
}

export interface ConfidencePolicy {
  minConfidenceScore: number;
  technical: {
    exactMatch: number;
    subfamilyMatch: number;
    familyMatch: number;
    projectInferredMatch: number;
  };
  experience: {
    completeHistory: number;
    missingHistoryDates: number;
  };
  semantic: {
    similarityWeight: number;
    profileMatchWeight: number;
  };
  logistics: {
    explicitPrefMatch: number;
    ambiguousPref: number;
  };
  richnessThresholds: {
    skillsWeight: number;
    experienceWeight: number;
    projectsWeight: number;
    educationWeight: number;
    achievementsWeight: number;
    certificationsWeight: number;
    minRichnessScore: number;
  };
}

export interface TransferabilityPolicy {
  factors: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export interface PenaltyPolicy {
  shortDescription: number;
  locationMismatch: number;
  experienceGapPerYear: number;
  employmentMismatch: number;
  criticalSkillMismatch: number;
  requiredSkillLowMatch: number;
}

export interface MatchingConfig {
  version: string;
  matching: MatchingPolicy;
  confidence: ConfidencePolicy;
  transferability: TransferabilityPolicy;
  penalties: PenaltyPolicy;
}

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  version: '1.0.0',
  matching: {
    minMatchScore: 30,
    minSemanticSimilarity: 0.5,
    useHardFilters: true,
    weights: {
      technical: 0.50,
      experience: 0.20,
      semantic: 0.20,
      logistics: 0.10,
    },
  },
  confidence: {
    minConfidenceScore: 50,
    technical: {
      exactMatch: 1.0,
      subfamilyMatch: 0.8,
      familyMatch: 0.6,
      projectInferredMatch: 0.7,
    },
    experience: {
      completeHistory: 1.0,
      missingHistoryDates: 0.5,
    },
    semantic: {
      similarityWeight: 0.7,
      profileMatchWeight: 0.3,
    },
    logistics: {
      explicitPrefMatch: 1.0,
      ambiguousPref: 0.7,
    },
    richnessThresholds: {
      skillsWeight: 0.20,
      experienceWeight: 0.20,
      projectsWeight: 0.20,
      educationWeight: 0.20,
      achievementsWeight: 0.10,
      certificationsWeight: 0.10,
      minRichnessScore: 0.40,
    },
  },
  transferability: {
    factors: {
      HIGH: 0.7,
      MEDIUM: 0.5,
      LOW: 0.3,
    },
  },
  penalties: {
    shortDescription: 20,
    locationMismatch: 20,
    experienceGapPerYear: 10,
    employmentMismatch: 8,
    criticalSkillMismatch: 30,
    requiredSkillLowMatch: 20,
  },
};

export const MATCHING_PENALTIES = DEFAULT_MATCHING_CONFIG.penalties;
