import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertsService {
  async getAppAlerts(appId: string): Promise<any> {
    const rateLimited = Math.random() < 0.5
    return rateLimited
  }
  async getTenantAlerts(tenantId: string): Promise<any> {
    const rateLimited = Math.random() < 0.5
    return rateLimited
  }
}
