import { Controller, Get, Param, UseGuards, Body, Post } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AuthGuard } from '../guards/auth.guard';
// TODO: create a centralised interface file?
interface CreateAppDto {
  name: string;
  description?: string;
}

@Controller('apps')
@UseGuards(AuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':userAddress')
  async getUserApps(@Param('userAddress') userAddress: string) {
    // @note: This action fetches apps by userAddress;
    return this.appsService.getAppsByUser(userAddress);
  }

  @Post(':userAddress')
  async createApp(
    @Param('userAddress') userAddress: string,
    @Body() createAppDto: CreateAppDto,
  ) {
    // @note: This action creates app for given userAddress;
    const { name, description } = createAppDto;
    return this.appsService.createApp(userAddress, name, description);
  }
}
