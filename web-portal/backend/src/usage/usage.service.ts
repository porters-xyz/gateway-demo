import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrometheusDriver } from 'prometheus-query';
import { createHash } from 'crypto';

@Injectable()
export class UsageService {
  private readonly prom: PrometheusDriver;

  constructor() {
    this.prom = new PrometheusDriver({
      endpoint:
        process.env.PROM_URL ??
        'https://api.fly.io/prometheus/porters-staging/',
      baseURL: '/api/v1',
      headers: {
        Authorization: String(process.env.PROM_TOKEN),
      },
    });
  }

  async getAppUsage(appId: string, period: string) {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');
    const q = `gateway_relay_usage{appId="${hashedAppId}"}`;
    const step = this.getStep(period);
    if (!step) {
      throw new HttpException('Unsupported period', HttpStatus.BAD_REQUEST);
    }
    const start = new Date().getTime() - step;
    const end = new Date().getTime();

    return await this.prom.rangeQuery(q, start, end, step);
  }

  async getTenantUsage(tenantId: string, period: string) {
    const q = `gateway_relay_usage{tenant="${tenantId}"}`;
    const step = this.getStep(period);
    if (!step) {
      throw new HttpException('Unsupported period', HttpStatus.BAD_REQUEST);
    }
    const start = new Date().getTime() - step;
    const end = new Date().getTime();

    return await this.prom.rangeQuery(q, start, end, step);
  }

  getStep(period: string) {
    switch (period) {
      case '1h':
        return 1 * 60 * 60; // 1 hour = 3600 seconds
      case '24h':
        return 24 * 60 * 60; // 24 hours = 86400 seconds
      case '7d':
        return 7 * 24 * 60 * 60; // 7 days = 604800 seconds
      case '30d':
        return 30 * 24 * 60 * 60; // 30 days = 2592000 seconds
      default:
        return null; // Return null for unsupported periods
    }
  }
}
