import { Controller, Get, Param, UseGuards, } from '@nestjs/common';
import { UsageService } from './usage.service';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) { }
  @Get('/app/:appId/:period')
  async getAppUsage(
    @Param('appId') appId: string,
    @Param('period') period: string,
  ) {
    return this.usageService.getAppUsage(appId, period);
  }

  @Get('/tenant/:tenantId/:period')
  async getTenantUsage(
    @Param('tenantId') tenantId: string,
    @Param('period') period: string,
  ) {
    return this.usageService.getTenantUsage(tenantId, period);
  }
}
