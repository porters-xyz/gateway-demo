import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { startOfHour, subSeconds, getTime, startOfDay } from 'date-fns';

@Injectable()
export class UsageService {
  async getAppUsage(appId: string, period: string): Promise<any> {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');
    const stepBack = this.getSeconds(period);
    const step = this.getStep(period);
    const end = this.getEnd(period);
    if (!stepBack || !step || !end) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }

    const start = subSeconds(end, stepBack);

    const q = `gateway_relay_usage{appId="${hashedAppId}"}`;

    console.log({ step, stepBack, start, end, q });

    const result = await this.fetchData(q, getTime(start), getTime(end), step);
    return result.json();
  }

  async getTenantUsage(tenantId: string, period: string): Promise<any> {
    const stepBack = this.getSeconds(period);
    const step = this.getStep(period);
    const end = this.getEnd(period);
    if (!stepBack || !step || !end) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }

    const start = subSeconds(end, stepBack);

    const q = `gateway_relay_usage{tenant="${tenantId}"}`;

    console.log({ step, stepBack, start, end, q });

    const result = await this.fetchData(q, getTime(start), getTime(end), step);
    return result.json();
  }

  private async fetchData(
    query: string,
    start: number,
    end: number,
    step: number | string,
  ): Promise<Response> {
    const url = `https://api.fly.io/prometheus/porters-staging/api/v1/query_range?query=${query}&start=${start}&end=${end}&step=${step}`;
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

  private getEnd(period: string): Date | null {
    switch (period) {
      case '1h':
        return startOfHour(new Date()); // 1 hour in ms
      case '24h':
        return startOfHour(new Date()); // 24 hours in ms
      case '7d':
        return startOfDay(new Date()); // 7 days in ms
      case '30d':
        return startOfDay(new Date()); // 30 days in ms
      default:
        return null;
    }
  }

  private getSeconds(period: string): number | null {
    switch (period) {
      case '1h':
        return 1 * 60 * 60 * 1000; // 1 hour in ms
      case '24h':
        return 24 * 60 * 60 * 1000; // 24 hours in ms
      case '7d':
        return 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      case '30d':
        return 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      default:
        return null;
    }
  }

  private getStep(period: string): string | null {
    switch (period) {
      case '24h':
        return '1h';
      case '1h':
        return '60s';
      case '7d':
        return '1d';
      case '30d':
        return '1d';
      default:
        return null;
    }
  }
}
