import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UsageService {
  async getAppUsage(appId: string, period: string): Promise<any> {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');

    const start = period
    const step = this.getStep(period)
    const q = `gateway_relay_usage{appId="${hashedAppId}"}`;

    if (!step || !period) {
      throw new HttpException(`Couldn't get tenant data`, HttpStatus.BAD_REQUEST)
    }

    const result = await this.fetchUsageData(q, start, step);
    return result.json();
  }

  async getTenantUsage(tenantId: string, period: string): Promise<any> {

    const q = `gateway_relay_usage{tenant="${tenantId}"}`;
    const start = period
    const step = this.getStep(period)

    if (!step || !period) {
      throw new HttpException(`Couldn't get tenant data`, HttpStatus.BAD_REQUEST)
    }

    const result = await this.fetchUsageData(q, start, step);
    return result.json();
  }

  private async fetchUsageData(
    query: string,
    start: string,
    step: number | string,
  ): Promise<Response> {

    const url = process.env.PROM_URL +`query_range?query=sum(increase(${query}))&start=${start}&end=now&step=${step}`;
    // do include `/` into url
    const result = await fetch(url, {
      headers: {
        Authorization: String(process.env.PROM_TOKEN),
      },
    });

    if (!result.ok) {
      throw new HttpException('Failed to fetch data', result.status);
    }

    return result;
  }


  private getStep(period: string): string | null {
    switch (period) {
      case '24h':
        return '1h';
      case '1h':
        return '5m';
      case '7d':
        return '1d';
      case '30d':
        return '1d';
      default:
        return null;
    }
  }

}
