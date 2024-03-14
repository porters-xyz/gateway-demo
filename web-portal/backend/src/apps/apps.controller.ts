import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':userAddress')
  async getUserApps(@Param('userAddress') userAddress: string) {
    // @note: This action fetches apps by tenant;
    return this.appsService.getAppsByUser(userAddress);
  }

  @Post(':userAddress')
  async createApp(@Param('userAddress') userAddress: string) {
    // @note: This action creates app for tenant by enterpriseId;
    return this.appsService.createApp(userAddress);
  }
}
