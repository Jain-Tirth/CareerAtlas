import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { JOB_PHASES } from './jobs.types';
import type { JobPhase } from './jobs.types';

export class CreateJobDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() company: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsInt() @Min(0) salaryMin?: number;
  @IsOptional() @IsInt() @Min(0) salaryMax?: number;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(JOB_PHASES) phase?: JobPhase;
  @IsOptional() @IsBoolean() bookmarked?: boolean;
  @IsOptional() @IsString() companyLogoUrl?: string;
  @IsOptional() @IsString() source?: string;
}

export class UpdateJobDto extends CreateJobDto {}

export class MoveJobDto {
  @IsIn(JOB_PHASES) phase: JobPhase;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class ReorderItemDto {
  @IsInt() id: number;
  @IsIn(JOB_PHASES) phase: JobPhase;
  @IsInt() @Min(0) sortOrder: number;
}

export class ReorderJobDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

export class ImportJobRowDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() company: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsInt() @Min(0) salaryMin?: number;
  @IsOptional() @IsInt() @Min(0) salaryMax?: number;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(JOB_PHASES) phase?: JobPhase;
  @IsOptional() @IsBoolean() bookmarked?: boolean;
}

export class ImportJobsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportJobRowDto)
  jobs: ImportJobRowDto[];
}
