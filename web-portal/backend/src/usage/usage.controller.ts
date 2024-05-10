import { Controller, Get, Param } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('/app/:appId')
  async getAppUsage(@Param('appId') appId: string) {
    return this.usageService.getAppUsage(appId);
  }

  @Get('/tenant/:tenantId')
  async getTenantUsage(@Param('tenantId') tenantId: string) {
    return this.usageService.getTenantUsage(tenantId);
  }
}
