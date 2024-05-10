import { Injectable } from '@nestjs/common';
import { PrometheusDriver } from 'prometheus-query';

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
    return `Usage for app ${appId}`;
  }

  async getTenantUsage(tenantId: string) {
    return `Usage for tenant ${tenantId}`;
  }
}
