import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('apps')
@UseGuards(AuthGuard)
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
