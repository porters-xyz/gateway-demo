import { Controller, Get, Param } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':tenantId')
  async createTenant(@Param('tenantId') tenantId: string) {
    // @note: This action fetches apps by tenant;
    return this.appsService.getAppsByTenant(tenantId);
  }
}
