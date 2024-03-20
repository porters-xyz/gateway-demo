import { Controller, Get, Param, UseGuards, Body } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('apps')
@UseGuards(AuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':userAddress')
  async getUserApps(@Param('userAddress') userAddress: string) {
    // @note: This action fetches apps by userAddress;
    return this.appsService.getAppsByUser(userAddress);
  }

  async createApp(
    @Param('userAddress') userAddress: string,
    @Body() body: { name: string; description?: string },
  ) {
    // @note: This action creates app for given userAddress;
    const { name, description } = body;
    return this.appsService.createApp(userAddress, name, description);
  }
}
