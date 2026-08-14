import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../vector-store/database.service';
import { CreateJobDto, UpdateJobDto, ImportJobRowDto } from './jobs.dto';
import { Job, JobPhase, JobRow, mapJobRow } from './jobs.types';

export interface ListFilters {
  phase?: string;
  tag?: string;
  company?: string;
  q?: string;
  bookmarked?: boolean;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class JobsService {
  constructor(readonly db: DatabaseService) {}

  async list(userId: number, filters: ListFilters): Promise<Job[]> {
    const clauses = ['user_id = $1'];
    const params: any[] = [userId];
    let i = 2;
    if (filters.phase) {
      clauses.push(`phase = $${i++}`);
      params.push(filters.phase);
    }
    if (filters.bookmarked) clauses.push('bookmarked = TRUE');
    if (filters.tag) {
      clauses.push(`$${i} = ANY(tags)`);
      params.push(filters.tag);
      i++;
    }
    if (filters.company) {
      clauses.push(`LOWER(company) = LOWER($${i++})`);
      params.push(filters.company);
    }
    if (filters.from) {
      clauses.push(`created_at::date >= $${i++}`);
      params.push(filters.from);
    }
    if (filters.to) {
      clauses.push(`created_at::date <= $${i++}`);
      params.push(filters.to);
    }
    if (filters.q && filters.q.trim() !== '') {
      const like = `%${filters.q.trim()}%`;
      clauses.push(
        `(title ILIKE $${i} OR company ILIKE $${i} OR location ILIKE $${i} OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${i}))`,
      );
      params.push(like);
      i++;
    }
    const limit = filters.limit ? Math.min(filters.limit, 200) : 200;
    const offset = filters.offset ?? 0;
    const res = await this.db.query(
      `SELECT * FROM jobs WHERE ${clauses.join(' AND ')} ORDER BY sort_order ASC, id ASC LIMIT $${i++} OFFSET $${i++}`,
      [...params, limit, offset],
    );
    return res.rows.map(mapJobRow);
  }

  private async getRow(userId: number, id: number): Promise<JobRow> {
    const res = await this.db.query(
      'SELECT * FROM jobs WHERE user_id = $1 AND id = $2',
      [userId, id],
    );
    if (res.rows.length === 0)
      throw new HttpException('Job not found.', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async get(userId: number, id: number): Promise<Job> {
    return mapJobRow(await this.getRow(userId, id));
  }

  async create(userId: number, dto: CreateJobDto): Promise<Job> {
    const phase = dto.phase ?? 'bookmarked';
    const orderRes = await this.db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM jobs WHERE user_id = $1 AND phase = $2',
      [userId, phase],
    );
    const sortOrder = orderRes.rows[0].next;
    const res = await this.db.query(
      `INSERT INTO jobs (user_id, title, company, location, salary_min, salary_max, url, notes, tags, phase, sort_order, bookmarked, source, company_logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        userId,
        dto.title,
        dto.company,
        dto.location ?? null,
        dto.salaryMin ?? null,
        dto.salaryMax ?? null,
        dto.url ?? null,
        dto.notes ?? null,
        dto.tags ?? [],
        phase,
        sortOrder,
        dto.bookmarked ?? false,
        dto.source ?? 'manual',
        dto.companyLogoUrl ?? null,
      ],
    );
    return mapJobRow(res.rows[0]);
  }

  async update(userId: number, id: number, dto: UpdateJobDto): Promise<Job> {
    const current = await this.getRow(userId, id);
    const merged = {
      title: dto.title ?? current.title,
      company: dto.company ?? current.company,
      location: dto.location !== undefined ? dto.location : current.location,
      salaryMin:
        dto.salaryMin !== undefined ? dto.salaryMin : current.salary_min,
      salaryMax:
        dto.salaryMax !== undefined ? dto.salaryMax : current.salary_max,
      url: dto.url !== undefined ? dto.url : current.url,
      notes: dto.notes !== undefined ? dto.notes : current.notes,
      tags: dto.tags ?? current.tags,
      phase: dto.phase ?? current.phase,
      bookmarked:
        dto.bookmarked !== undefined ? dto.bookmarked : current.bookmarked,
      companyLogoUrl:
        dto.companyLogoUrl !== undefined
          ? dto.companyLogoUrl
          : current.company_logo_url,
    };
    const res = await this.db.query(
      `UPDATE jobs SET title=$3, company=$4, location=$5, salary_min=$6, salary_max=$7, url=$8, notes=$9, tags=$10, phase=$11, bookmarked=$12, company_logo_url=$13, updated_at=NOW()
       WHERE user_id = $1 AND id = $2 RETURNING *`,
      [
        userId,
        id,
        merged.title,
        merged.company,
        merged.location,
        merged.salaryMin,
        merged.salaryMax,
        merged.url,
        merged.notes,
        merged.tags,
        merged.phase,
        merged.bookmarked,
        merged.companyLogoUrl,
      ],
    );
    return mapJobRow(res.rows[0]);
  }

  async remove(userId: number, id: number): Promise<void> {
    const res = await this.db.query(
      'DELETE FROM jobs WHERE user_id = $1 AND id = $2',
      [userId, id],
    );
    if (res.rowCount === 0)
      throw new HttpException('Job not found.', HttpStatus.NOT_FOUND);
  }

  async move(
    userId: number,
    id: number,
    phase: JobPhase,
    sortOrder?: number,
  ): Promise<Job> {
    const current = await this.getRow(userId, id);
    let nextOrder = sortOrder;
    if (nextOrder === undefined) {
      const orderRes = await this.db.query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM jobs WHERE user_id = $1 AND phase = $2',
        [userId, phase],
      );
      nextOrder = orderRes.rows[0].next;
    }
    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');
      const updated = await client.query(
        'UPDATE jobs SET phase=$3, sort_order=$4, last_moved_at=NOW(), updated_at=NOW() WHERE user_id=$1 AND id=$2 RETURNING *',
        [userId, id, phase, nextOrder],
      );
      if (updated.rows.length === 0)
        throw new HttpException('Job not found.', HttpStatus.NOT_FOUND);
      await client.query(
        'INSERT INTO job_phase_changes (job_id, user_id, from_phase, to_phase) VALUES ($1,$2,$3,$4)',
        [id, userId, current.phase, phase],
      );
      await client.query('COMMIT');
      return mapJobRow(updated.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async reorder(
    userId: number,
    items: { id: number; phase: JobPhase; sortOrder: number }[],
  ): Promise<{ success: boolean }> {
    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const prev = await client.query(
          'SELECT phase FROM jobs WHERE user_id=$1 AND id=$2',
          [userId, item.id],
        );
        if (prev.rows.length === 0) continue;
        const fromPhase: JobPhase = prev.rows[0].phase;
        await client.query(
          'UPDATE jobs SET phase=$3, sort_order=$4, last_moved_at=CASE WHEN phase <> $3 THEN NOW() ELSE last_moved_at END, updated_at=NOW() WHERE user_id=$1 AND id=$2',
          [userId, item.id, item.phase, item.sortOrder],
        );
        if (fromPhase !== item.phase) {
          await client.query(
            'INSERT INTO job_phase_changes (job_id, user_id, from_phase, to_phase) VALUES ($1,$2,$3,$4)',
            [item.id, userId, fromPhase, item.phase],
          );
        }
      }
      await client.query('COMMIT');
      return { success: true };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  toCsv(rows: Record<string, any>[]): string {
    if (rows.length === 0) return '';
    const keys = Object.keys(rows[0]);
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [keys.join(',')];
    for (const row of rows)
      lines.push(keys.map((k) => escape(row[k])).join(','));
    return lines.join('\n');
  }

  parseCsv(text: string): Record<string, string>[] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let idx = 0; idx < text.length; idx++) {
      const ch = text[idx];
      if (inQuotes) {
        if (ch === '"') {
          if (text[idx + 1] === '"') {
            field += '"';
            idx++;
          } else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[idx + 1] === '\n') idx++;
        row.push(field);
        field = '';
        if (row.some((c) => c.trim() !== '')) rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
    row.push(field);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
    if (rows.length < 2) return [];
    const header = rows[0].map((h) => h.trim());
    return rows.slice(1).map((values) => {
      const obj: Record<string, string> = {};
      header.forEach((h, k) => {
        obj[h] = (values[k] ?? '').trim();
      });
      return obj;
    });
  }

  applyMapping(
    csvRow: Record<string, string>,
    mapping: Record<string, string>,
  ): Partial<ImportJobRowDto> {
    const out: any = {};
    for (const [header, field] of Object.entries(mapping)) {
      const value = csvRow[header];
      if (value === undefined || value === '') continue;
      if (field === 'tags') {
        out.tags = value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (field === 'salaryMin' || field === 'salaryMax') {
        const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) out[field] = num;
      } else if (field === 'bookmarked') {
        out.bookmarked = ['true', 'yes', '1'].includes(value.toLowerCase());
      } else {
        out[field] = value;
      }
    }
    return out;
  }

  async importJobs(
    userId: number,
    rows: ImportJobRowDto[],
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];
      if (!r.title || !r.title.trim() || !r.company || !r.company.trim()) {
        errors.push(`Row ${idx + 1}: missing title or company`);
        continue;
      }
      const dup = await this.db.query(
        'SELECT 1 FROM jobs WHERE user_id=$1 AND LOWER(title)=LOWER($2) AND LOWER(company)=LOWER($3) LIMIT 1',
        [userId, r.title.trim(), r.company.trim()],
      );
      if (dup.rows.length > 0) {
        skipped++;
        continue;
      }
      await this.create(userId, {
        ...r,
        title: r.title.trim(),
        company: r.company.trim(),
        source: 'import',
      });
      imported++;
    }
    return { imported, skipped, errors };
  }

  async importCsv(
    userId: number,
    csvText: string,
    mapping: Record<string, string>,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const rows = this.parseCsv(csvText).map((row) =>
      this.applyMapping(row, mapping),
    );
    return this.importJobs(userId, rows as ImportJobRowDto[]);
  }

  async exportJobs(
    userId: number,
    format: 'json' | 'csv',
  ): Promise<Job[] | string> {
    const res = await this.db.query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY phase ASC, sort_order ASC, id ASC',
      [userId],
    );
    const jobs = res.rows.map(mapJobRow);
    if (format === 'json') return jobs;
    return this.toCsv(jobs);
  }
}
