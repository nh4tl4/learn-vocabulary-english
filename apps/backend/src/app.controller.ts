import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get('health')
  async healthCheck() {
    try {
      // Check database connectivity
      const dbHealth = await this.dataSource.query('SELECT 1 as health');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'vocabulary-backend',
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: !!dbHealth,
          type: this.dataSource.options.type,
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'vocabulary-backend',
        error: error.message,
      };
    }
  }
}
