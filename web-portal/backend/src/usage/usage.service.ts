import { Injectable } from '@nestjs/common';
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

  async getAppUsage(appId: string) {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');
    const q = `gateway_relay_usage{appId="${hashedAppId}"}`;
    const start = new Date().getTime() - 24 * 60 * 60 * 1000;
    const end = new Date().getTime();
    this.prom.rangeQuery(q, start, end, step);
    return `Usage for app ${appId}`;
  }

  async getTenantUsage(tenantId: string) {
    return `Usage for tenant ${tenantId}`;
  }
}
