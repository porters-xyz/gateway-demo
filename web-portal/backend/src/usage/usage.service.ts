import { Injectable } from '@nestjs/common';

@Injectable()
export class UsageService {
  async getAppUsage(appId: string) {
    return `Usage for app ${appId}`;
  }
  async getTenantUsage(tenantId: string) {
    return `Usage for tenant ${tenantId}`;
  }
}
