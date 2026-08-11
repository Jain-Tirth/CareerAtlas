import { Pool } from 'pg';
import * as crypto from 'crypto';

const DEMO_JOBS = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'Remote',
    salaryMin: 150000,
    salaryMax: 210000,
    tags: ['react', 'typescript', 'remote'],
    phase: 'bookmarked',
    bookmarked: true,
  },
  {
    title: 'Full Stack Engineer',
    company: 'Notion',
    location: 'San Francisco',
    salaryMin: 140000,
    salaryMax: 200000,
    tags: ['node', 'react', 'sql'],
    phase: 'bookmarked',
    bookmarked: false,
  },
  {
    title: 'Backend Engineer',
    company: 'Linear',
    location: 'New York',
    salaryMin: 160000,
    salaryMax: 220000,
    tags: ['typescript', 'postgres'],
    phase: 'applied',
    bookmarked: false,
  },
  {
    title: 'Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    salaryMin: 130000,
    salaryMax: 190000,
    tags: ['react', 'nextjs'],
    phase: 'applied',
    bookmarked: false,
  },
  {
    title: 'Software Engineer II',
    company: 'Figma',
    location: 'Seattle',
    salaryMin: 145000,
    salaryMax: 205000,
    tags: ['typescript', 'wasm'],
    phase: 'interviewing',
    bookmarked: false,
  },
  {
    title: 'Product Engineer',
    company: 'Loom',
    location: 'Remote',
    salaryMin: 140000,
    salaryMax: 195000,
    tags: ['react', 'product'],
    phase: 'interviewing',
    bookmarked: false,
  },
  {
    title: 'Platform Engineer',
    company: 'Supabase',
    location: 'Remote',
    salaryMin: 150000,
    salaryMax: 200000,
    tags: ['typescript', 'edge'],
    phase: 'accepted',
    bookmarked: false,
  },
  {
    title: 'Staff Engineer',
    company: 'Render',
    location: 'San Francisco',
    salaryMin: 180000,
    salaryMax: 260000,
    tags: ['rust', 'infra'],
    phase: 'accepted',
    bookmarked: false,
  },
  {
    title: 'Engineering Manager',
    company: 'Airbnb',
    location: 'Remote',
    salaryMin: 170000,
    salaryMax: 230000,
    tags: ['management', 'remote'],
    phase: 'rejected',
    bookmarked: false,
  },
];

async function main() {
  const email = process.env.SEED_EMAIL || 'demo@careeratlas.app';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let userId: number;
  const userRes = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
    [email],
  );
  if (userRes.rows.length > 0) {
    userId = userRes.rows[0].id;
  } else {
    const created = await pool.query(
      'INSERT INTO users (full_name, email) VALUES ($1, $2) RETURNING id',
      ['Demo User', email],
    );
    userId = created.rows[0].id;
  }

  let inserted = 0;
  for (const job of DEMO_JOBS) {
    const dup = await pool.query(
      'SELECT 1 FROM jobs WHERE user_id=$1 AND LOWER(title)=LOWER($2) AND LOWER(company)=LOWER($3)',
      [userId, job.title, job.company],
    );
    if (dup.rows.length > 0) continue;
    const orderRes = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM jobs WHERE user_id=$1 AND phase=$2',
      [userId, job.phase],
    );
    await pool.query(
      `INSERT INTO jobs (user_id, title, company, location, salary_min, salary_max, url, notes, tags, phase, sort_order, bookmarked, source)
       VALUES ($1,$2,$3,$4,$5,$6,NULL,NULL,$7,$8,$9,$10,'import')`,
      [
        userId,
        job.title,
        job.company,
        job.location,
        job.salaryMin,
        job.salaryMax,
        job.tags,
        job.phase,
        orderRes.rows[0].next,
        job.bookmarked,
      ],
    );
    inserted++;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO sessions (user_id, email, session_token, expires_at) VALUES ($1,$2,$3,$4)',
    [userId, email, token, expiresAt],
  );
  try {
    await pool.query(
      'INSERT INTO job_phase_changes (job_id, user_id, from_phase, to_phase) SELECT id, user_id, NULL, phase FROM jobs WHERE user_id=$1',
      [userId],
    );
  } catch {}
  await pool.end();

  console.log(`Seeded ${inserted} jobs for ${email} (user id ${userId}).`);
  console.log(`E2E_SESSION_TOKEN=${token}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
