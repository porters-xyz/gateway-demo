import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':tenantId')
  async getTenantApps(@Param('tenantId') tenantId: string) {
    // @note: This action fetches apps by tenant;
    return this.appsService.getAppsByTenant(tenantId);
  }

  @Post()
  async createApp() {
    // @note: This action creates app for tenant;
    // TODO- decide how to get tenantId; via cookies or some other alternative;
    const tenantId = 'hellotenant';
    return this.appsService.createApp(tenantId);
  }
}
