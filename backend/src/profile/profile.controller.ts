import { Controller, Post, Get, Patch, Delete, Body, UploadedFile, UseInterceptors, HttpCode, HttpStatus, Logger, Query, Param, Sse, MessageEvent } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService, UserProfile } from './profile.service';
import { Observable, interval, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface StartWorkflowDto {
  searchTerms: string[];
  locationPreference: string;
  isRemoteOpen: boolean;
  userEmail?: string;
}

@Controller('api/profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  @Post('upload-resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    @Body('versionName') customVersionName?: string,
  ): Promise<{ success: boolean; taskId: string }> {
    if (!file) {
      throw new Error('No resume file was uploaded.');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Only PDF resume files are accepted.');
    }
    const taskId = 'parse_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString().slice(-4);
    this.logger.log(`[API] Received resume file "${file.originalname}" (${file.size} bytes). Assigned background taskId: ${taskId}`);
    
    // Spawn parsing job in the background asynchronously with filename & custom name support
    this.profileService.runBackgroundParse(taskId, file.buffer, file.originalname, customVersionName);
    
    return { success: true, taskId };
  }

  @Sse('parse-status/:taskId')
  parseStatus(@Param('taskId') taskId: string): Observable<MessageEvent> {
    this.logger.log(`[API] Client subscribing to SSE parse stream for taskId: ${taskId}`);
    
    const heartbeats = interval(15000).pipe(
      map(() => ({
        data: {
          status: 'ping',
          log: 'ping',
        }
      } as MessageEvent))
    );

    const events = this.profileService.getTaskEventStream(taskId).pipe(
      filter(event => event.taskId === taskId),
      map(event => ({
        data: {
          status: event.status,
          log: event.log,
          errorDetails: event.errorDetails,
          profile: event.profile,
        }
      } as MessageEvent))
    );

    return merge(events, heartbeats);
  }

  @Get()
  async getProfile(@Query('email') email?: string): Promise<UserProfile> {
    let profile: UserProfile | null = null;
    
    if (email) {
      profile = await this.profileService.getProfileByEmail(email);
    } else {
      const pool = (this.profileService as any).db.getPool();
      const usersRes = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
      if (usersRes.rows.length > 0) {
        profile = await this.profileService.getProfileById(usersRes.rows[0].id);
      }
    }

    if (!profile) {
      return {
        fullName: 'No Resume Uploaded',
        email: '',
        skills: [],
        experienceYears: 0,
        education: [],
        projects: [],
        achievements: [],
        preferredRoles: [],
        preferences: {
          locations: [],
          remote: true,
          employmentTypes: [],
        },
      };
    }

    return profile;
  }

  @Get('versions')
  async getVersions(@Query('email') email?: string): Promise<any[]> {
    const profile = await this.getProfile(email);
    if (!profile || !profile.id) return [];
    return this.profileService.getUserVersions(profile.id);
  }

  @Post('versions/:id/activate')
  async activateVersion(
    @Param('id') id: string,
    @Query('email') email?: string,
  ): Promise<{ success: boolean; profile?: UserProfile }> {
    const profile = await this.getProfile(email);
    if (!profile || !profile.id) throw new Error('User profile not found.');
    const activated = await this.profileService.activateResumeVersion(profile.id, parseInt(id, 10));
    return { success: !!activated, profile: activated || undefined };
  }

  @Patch('versions/:id')
  async renameVersion(
    @Param('id') id: string,
    @Body('versionName') versionName: string,
    @Query('email') email?: string,
  ): Promise<{ success: boolean }> {
    const profile = await this.getProfile(email);
    if (!profile || !profile.id) throw new Error('User profile not found.');
    const ok = await this.profileService.renameResumeVersion(profile.id, parseInt(id, 10), versionName);
    return { success: ok };
  }

  @Delete('versions/:id')
  async deleteVersion(
    @Param('id') id: string,
    @Query('email') email?: string,
  ): Promise<{ success: boolean }> {
    const profile = await this.getProfile(email);
    if (!profile || !profile.id) throw new Error('User profile not found.');
    const ok = await this.profileService.deleteResumeVersion(profile.id, parseInt(id, 10));
    return { success: ok };
  }

  @Get('suggest-titles')
  async suggestTitles(@Query('email') email?: string): Promise<{ searchTerms: string[] }> {
    const profile = await this.getProfile(email);
    if (!profile.email) {
      return { searchTerms: ['Software Engineer'] };
    }
    const searchTerms = await this.profileService.suggestJobTitles(profile);
    return { searchTerms: searchTerms.length > 0 ? searchTerms : ['Software Engineer'] };
  }
}
