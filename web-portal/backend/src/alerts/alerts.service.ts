import { HttpException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';


interface PromResponse {
  data: {
    result: {
      value: any[];
    };
  };
}

@Injectable()
export class AlertsService {

  async getAppAlerts(appId: string): Promise<any> {
    const hashedAppId = createHash('sha256').update(appId).digest('hex');
    const result = await this.fetchRateLimitStatus({ appId: hashedAppId })
    return result.json()
  }

  async getTenantAlerts(tenantId: string): Promise<any> {
    const result = await this.fetchRateLimitStatus({ tenantId })
    return result.json()
  }

  private async fetchRateLimitStatus(
    { tenantId, appId }: { tenantId?: string; appId?: string }
  ): Promise<Response> {

    const query = tenantId
      ? `query?query=gateway_rate_limit_hit{tenant="${tenantId}"}`
      : `query?query=gateway_rate_limit_hit{appId="${appId}"}`;

    const url = process.env.PROM_URL + query;

    const res = await fetch(url, {
      headers: {
        Authorization: String(process.env.PROM_TOKEN),
      },
    });

    if (!res.ok) {
      throw new HttpException('Failed to fetch data', res.status);
    }


    return res
  }

}
