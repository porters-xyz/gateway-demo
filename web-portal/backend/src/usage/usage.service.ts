import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UsageService {
  async getAppUsage(appId: string, period: string): Promise<any> {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');
    const step = this.getStep(period);
    const end = Date.now();
    if (!step || !end) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }


    const q = `gateway_relay_usage{appId="${hashedAppId}"}`;

    console.log({ step, end, q, appId });

    const result = await this.fetchData(q,  end, step);
    return result.json();
  }

  async getTenantUsage(tenantId: string, period: string): Promise<any> {
    const step = this.getStep(period);
    const end = Date.now();
    if (!step || !end) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }

    const q = `gateway_relay_usage{tenant="${tenantId}"}`;

    console.log({ step, end, q, tenantId });

    const result = await this.fetchData(q,  end, step);
    return result.json();
  }

  private async fetchData(
    query: string,
    end: number,
    step: number | string,
  ): Promise<Response> {
    const url = `https://api.fly.io/prometheus/porters-staging/api/v1/query_range?query=sum(${query})&end=${end}&step=${step}`;

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
        return '300';
      case '7d':
        return '1d';
      case '30d':
        return '1d';
      default:
        return null;
    }
  }
}
