export const JOB_PHASES = [
  'bookmarked',
  'applied',
  'interviewing',
  'accepted',
  'rejected',
] as const;
export type JobPhase = (typeof JOB_PHASES)[number];

export interface JobRow {
  id: number;
  user_id: number;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  url: string | null;
  notes: string | null;
  tags: string[];
  phase: JobPhase;
  sort_order: number;
  bookmarked: boolean;
  source: string;
  company_logo_url: string | null;
  created_at: string;
  updated_at: string;
  last_moved_at: string | null;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  url: string | null;
  notes: string | null;
  tags: string[];
  phase: JobPhase;
  sortOrder: number;
  bookmarked: boolean;
  source: string;
  companyLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastMovedAt: string | null;
}

export function mapJobRow(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    url: row.url,
    notes: row.notes,
    tags: row.tags ?? [],
    phase: row.phase,
    sortOrder: row.sort_order,
    bookmarked: row.bookmarked,
    source: row.source,
    companyLogoUrl: row.company_logo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMovedAt: row.last_moved_at,
  };
}
