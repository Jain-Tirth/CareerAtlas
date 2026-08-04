import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './vector-store/database.service';

@Controller()
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  async getHealth() {
    let dbStatus = 'ok';
    try {
      await this.db.query('SELECT 1');
    } catch {
      dbStatus = 'degraded';
    }

    return {
      status: 'ok',
      database: dbStatus,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/health')
  async getApiHealth() {
    return this.getHealth();
  }
}
