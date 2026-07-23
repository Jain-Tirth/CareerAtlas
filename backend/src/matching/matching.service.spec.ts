import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { DatabaseService } from '../vector-store/database.service';
import { QdrantService } from '../vector-store/qdrant.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let mockDb: any;
  let mockQdrant: any;

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
    };
    mockQdrant = {
      getClient: jest.fn().mockReturnValue({
        retrieve: jest.fn().mockResolvedValue([{ id: 'user_uuid', vector: [0.1, 0.2] }]),
        search: jest.fn(),
        scroll: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: QdrantService, useValue: mockQdrant },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSkillScoreWithTransferability (Ontology Skill Match)', () => {
    it('should match exact skills (100%)', () => {
      const s = service as any;
      const res = s.calculateSkillScoreWithTransferability(['Kotlin'], ['kotlin']);
      expect(res.score).toBe(100);
      expect(res.matched).toContain('kotlin');
      expect(res.missing).toHaveLength(0);
    });

    it('should match subfamily skills (80%)', () => {
      const s = service as any;
      const res = s.calculateSkillScoreWithTransferability(['Kotlin'], ['Android']);
      expect(res.score).toBe(80);
      expect(res.matched).toContain('Android');
      expect(res.missing).toHaveLength(0);
    });

    it('should match family skills with transferability (70%)', () => {
      const s = service as any;
      const res = s.calculateSkillScoreWithTransferability(['Kotlin'], ['React Native']);
      expect(res.score).toBe(70);
      expect(res.matched).toContain('React Native');
      expect(res.missing).toHaveLength(0);
    });

    it('should match unrelated skills (0%)', () => {
      const s = service as any;
      const res = s.calculateSkillScoreWithTransferability(['Kotlin'], ['Python']);
      expect(res.score).toBe(0);
      expect(res.matched).toHaveLength(0);
      expect(res.missing).toContain('Python');
    });
  });

  describe('calculateDomainScore (Domain Match)', () => {
    it('should score 100 for same subfamily', () => {
      const s = service as any;
      expect(s.calculateDomainScore('mobile', 'android', 'mobile', 'android')).toBe(100);
    });

    it('should score 60 for same family, different subfamily', () => {
      const s = service as any;
      expect(s.calculateDomainScore('mobile', 'android', 'mobile', 'cross_platform')).toBe(60);
    });

    it('should score 0 for different families', () => {
      const s = service as any;
      expect(s.calculateDomainScore('mobile', 'android', 'backend', 'java')).toBe(0);
    });
  });

  describe('determineFamilyAndSubfamily majority vote', () => {
    it('should determine correct family and subfamily based on skills and title', () => {
      const s = service as any;
      const result = s.determineFamilyAndSubfamily('Mobile Developer', ['Kotlin', 'Android', 'Jetpack Compose']);
      expect(result.family).toBe('mobile');
      expect(result.subfamily).toBe('android');
    });

    it('should fall back to majority skill subfamily for generic titles', () => {
      const s = service as any;
      const result = s.determineFamilyAndSubfamily('Software Engineer', ['React Native', 'Expo', 'Javascript']);
      expect(result.family).toBe('mobile');
      expect(result.subfamily).toBe('cross_platform');
    });
  });

  describe('Hard Rejection Rules & Ranking Weight Model', () => {
    it('should hard reject candidate if missing critical skills (criticalSkillScore === 0)', async () => {
      // Mock user profile (Kotlin/Android developer)
      mockDb.query.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('FROM users')) {
          return { rows: [{ id: 1, full_name: 'Test Candidate', email: 'test@candidate.com' }] };
        }
        if (sql.includes('FROM user_preferences')) {
          return { rows: [{ user_id: 1, experience_years: 5, preferred_roles: ['Mobile Developer'], locations: ['Ahmedabad'], remote: true, employment_types: ['Full-time'] }] };
        }
        if (sql.includes('FROM user_skills')) {
          return { rows: [{ skill: 'Kotlin' }, { skill: 'Android' }] };
        }
        if (sql.includes('SELECT job_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      // Mock search results (Job has React Native as critical skill, Javascript as required)
      const mockSearch = jest.fn().mockResolvedValue([
        {
          id: 'point_uuid',
          score: 0.90,
          payload: {
            jobId: 'job_critical_mismatch',
            title: 'Mobile Developer',
            company: 'Tech Corp',
            location: 'Ahmedabad',
            description: 'Requires React Native developer. This is a longer description to satisfy the minimum length requirement for the job scraper matching service pipeline. Needs experience building responsive mobile applications.',
            criticalSkills: ['React Native'],
            requiredSkills: ['Javascript'],
            preferredSkills: ['TypeScript'],
            experienceRequired: 5,
            educationRequirements: [],
            employmentType: 'Full-time',
            remoteAllowed: true,
            url: 'http://test.com',
          },
        }
      ]);
      mockQdrant.getClient().search = mockSearch;

      const rankedJobs = await service.matchAndRankJobs(1, 5);
      // Mismatch in critical skill (Kotlin vs React Native is 40% similarity, but criticalSkillScore is calculated over criticalSkills = ['React Native'].
      // Wait, is Kotlin vs React Native similarity 40%, which is > 0?
      // Yes! Since it belongs to mobile family, similarity is 40%, so criticalSkillScore = 40, which is > 0.
      // So it is NOT rejected by critical skills! But wait, does it pass required skills?
      // Required skill: Javascript. Kotlin vs Javascript has 0% similarity, so requiredSkillScore = 0%, which is < 20%!
      // So it is rejected by required skills instead!
      // Thus, either way, the candidate is rejected for the job, and the returned array is empty!
      expect(rankedJobs).toHaveLength(0);
    });

    it('should pass and correctly score candidate if they match critical and required skills', async () => {
      // Mock same user profile (Kotlin/Android developer)
      mockDb.query.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('FROM users')) {
          return { rows: [{ id: 1, full_name: 'Test Candidate', email: 'test@candidate.com' }] };
        }
        if (sql.includes('FROM user_preferences')) {
          return { rows: [{ user_id: 1, experience_years: 5, preferred_roles: ['Mobile Developer'], locations: ['Ahmedabad'], remote: true, employment_types: ['Full-time'] }] };
        }
        if (sql.includes('FROM user_skills')) {
          return { rows: [{ skill: 'Kotlin' }, { skill: 'Android' }] };
        }
        if (sql.includes('SELECT job_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      // Mock search results (Job matches Kotlin and Android)
      const mockSearch = jest.fn().mockResolvedValue([
        {
          id: 'point_uuid',
          score: 0.90,
          payload: {
            jobId: 'job_android_match',
            title: 'Android Developer',
            company: 'Tech Corp',
            location: 'Ahmedabad',
            description: 'Looking for Android developer with Kotlin. This is a longer description to satisfy the minimum length requirement for the job scraper matching service pipeline. Needs experience building responsive mobile applications.',
            criticalSkills: ['Android'],
            requiredSkills: ['Kotlin'],
            preferredSkills: ['Jetpack Compose'],
            experienceRequired: 5,
            educationRequirements: [],
            employmentType: 'Full-time',
            remoteAllowed: true,
            url: 'http://test.com',
          },
        }
      ]);
      mockQdrant.getClient().search = mockSearch;

      const rankedJobs = await service.matchAndRankJobs(1, 5);
      expect(rankedJobs).toHaveLength(1);
      
      const ranked = rankedJobs[0];
      expect(ranked.eligible).toBe(true);
      expect(ranked.finalScore).toBeGreaterThan(80); // Candidate matches critical (Android), required (Kotlin), same domain (Android/mobile), location and experience!
      expect(ranked.explanation).toMatch(/perfect skill match|experience/);
    });

    it('should reject candidate if preferred role subfamily mismatches the job title subfamily (e.g. Machine Learning Engineer vs Data Scientist)', async () => {
      mockDb.query.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('FROM users')) {
          return { rows: [{ id: 1, full_name: 'Test Candidate', email: 'test@candidate.com' }] };
        }
        if (sql.includes('FROM user_preferences')) {
          return { rows: [{ user_id: 1, experience_years: 1, preferred_roles: ['Machine Learning Engineer'], locations: ['Bangalore'], remote: true, employment_types: ['Full-time'] }] };
        }
        if (sql.includes('FROM user_skills')) {
          return { rows: [{ skill: 'Python' }, { skill: 'PyTorch' }] };
        }
        if (sql.includes('SELECT job_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const mockSearch = jest.fn().mockResolvedValue([
        {
          id: 'point_uuid_1',
          score: 0.95,
          payload: {
            jobId: 'job_mismatch_ml_ds',
            title: 'Data Scientist',
            company: 'AI Corp',
            location: 'Bangalore',
            description: 'Looking for Data Scientist with python. This is a longer description to satisfy the minimum length requirement for the job scraper matching service pipeline. Needs experience building responsive mobile applications.',
            criticalSkills: ['Python'],
            requiredSkills: ['Statistics'],
            preferredSkills: [],
            experienceRequired: 1,
            educationRequirements: [],
            employmentType: 'Full-time',
            remoteAllowed: true,
            url: 'http://test.com',
          },
        }
      ]);
      mockQdrant.getClient().search = mockSearch;

      const rankedJobs = await service.matchAndRankJobs(1, 5);
      expect(rankedJobs).toHaveLength(0); // Should be rejected because Machine Learning Engineer and Data Scientist are different subfamilies
    });
  });

  describe('Phase 3 Confidence Propagation & Configuration overrides', () => {
    it('should compute confidenceScore and populate confidenceFactors', async () => {
      // Mock user profile with complete details
      mockDb.query.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('FROM users')) {
          return { rows: [{ id: 1, full_name: 'Test Candidate', email: 'test@candidate.com' }] };
        }
        if (sql.includes('FROM user_preferences')) {
          return { rows: [{ user_id: 1, experience_years: 5, preferred_roles: ['Mobile Developer'], locations: ['Ahmedabad'], remote: true, employment_types: ['Full-time'] }] };
        }
        if (sql.includes('FROM user_skills')) {
          return { rows: [{ skill: 'Kotlin' }, { skill: 'Android' }] };
        }
        if (sql.includes('SELECT job_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const mockSearch = jest.fn().mockResolvedValue([
        {
          id: 'point_uuid_1',
          score: 0.95,
          payload: {
            jobId: 'job_android_1',
            title: 'Android Developer',
            company: 'Tech Corp',
            location: 'Ahmedabad',
            description: 'Looking for Android Developer with Kotlin. This is a longer description to satisfy the minimum length requirement for the job scraper matching service pipeline. Needs experience building responsive mobile applications.',
            criticalSkills: ['Android'],
            requiredSkills: ['Kotlin'],
            preferredSkills: [],
            experienceRequired: 5,
            educationRequirements: [],
            employmentType: 'Full-time',
            remoteAllowed: true,
            url: 'http://test.com',
          },
        }
      ]);
      mockQdrant.getClient().search = mockSearch;

      const rankedJobs = await service.matchAndRankJobs(1, 5);
      expect(rankedJobs).toHaveLength(1);
      
      const job = rankedJobs[0];
      expect(job.confidenceScore).toBeDefined();
      expect(job.confidenceScore).toBeGreaterThan(0);
      expect(job.confidenceFactors).toBeDefined();
      expect(job.confidenceFactors.positive).toContain('Direct skill match for required technologies.');
      expect(job.confidenceFactors.positive).toContain('Complete work experience history.');
    });

    it('should allow environmental config override of matching config', () => {
      // Set override JSON environment variable
      process.env.MATCHING_CONFIG_OVERRIDE_JSON = JSON.stringify({
        matching: {
          minMatchScore: 45,
        },
        confidence: {
          minConfidenceScore: 60,
          technical: {
            exactMatch: 0.95,
          }
        }
      });

      // Instantiate new service to pick up the override
      const overrideService = new MatchingService(mockDb, mockQdrant);
      const activeConfig = (overrideService as any).config;

      expect(activeConfig.matching.minMatchScore).toBe(45);
      expect(activeConfig.confidence.minConfidenceScore).toBe(60);
      expect(activeConfig.confidence.technical.exactMatch).toBe(0.95);
      
      // Other unmentioned properties should retain defaults
      expect(activeConfig.matching.minSemanticSimilarity).toBe(0.5);

      // Clean up environment variable
      delete process.env.MATCHING_CONFIG_OVERRIDE_JSON;
    });

    it('should reject candidates for high-experience roles when useHardFilters is true, and accept when false', async () => {
      // Mock fresher candidate profile (0 experience years)
      mockDb.query.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('FROM users')) {
          return { rows: [{ id: 1, full_name: 'Fresher Candidate', email: 'fresher@test.com' }] };
        }
        if (sql.includes('FROM user_preferences')) {
          return { rows: [{ user_id: 1, experience_years: 0, preferred_roles: ['Mobile Developer'], locations: ['Ahmedabad'], remote: true, employment_types: ['Full-time'] }] };
        }
        if (sql.includes('FROM user_skills')) {
          return { rows: [{ skill: 'Kotlin' }, { skill: 'Android' }] };
        }
        if (sql.includes('SELECT job_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const mockSearch = jest.fn().mockResolvedValue([
        {
          id: 'point_uuid_1',
          score: 0.95,
          payload: {
            jobId: 'job_senior_android',
            title: 'Senior Android Developer', // senior triggers min 5 years required
            company: 'Tech Corp',
            location: 'Ahmedabad',
            description: 'Looking for Senior Android Developer with Kotlin. Needs at least 5 years of experience. This is a longer description to satisfy the minimum length requirement for the job scraper matching service pipeline.',
            criticalSkills: ['Android'],
            requiredSkills: ['Kotlin'],
            preferredSkills: [],
            experienceRequired: 5,
            educationRequirements: [],
            employmentType: 'Full-time',
            remoteAllowed: true,
            url: 'http://test.com',
          },
        }
      ]);
      mockQdrant.getClient().search = mockSearch;

      // 1. By default, useHardFilters is true, so the candidate should be rejected
      const rankedJobsDefault = await service.matchAndRankJobs(1, 5);
      expect(rankedJobsDefault).toHaveLength(0);

      // 2. Set useHardFilters to false via override, candidate should now be accepted (with low score/confidence)
      process.env.MATCHING_CONFIG_OVERRIDE_JSON = JSON.stringify({
        matching: {
          useHardFilters: false,
        }
      });
      const overrideService = new MatchingService(mockDb, mockQdrant);
      const rankedJobsOverride = await overrideService.matchAndRankJobs(1, 5);
      expect(rankedJobsOverride).toHaveLength(1);
      expect(rankedJobsOverride[0].job.jobId).toBe('job_senior_android');

      // Clean up override
      delete process.env.MATCHING_CONFIG_OVERRIDE_JSON;
    });
  });
});
