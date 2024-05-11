import {
  Controller,
  Get,
  Param,
  UseGuards,
  Body,
  Post,
  Put,
  Patch,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { AuthGuard } from '../guards/auth.guard';
import { Delete } from '@nestjs/common';

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

  @Delete(':appId')
  async deleteApp(@Param('appId') appId: string) {
    // @note: This action deletes app for given appId;
    return this.appsService.deleteApp(appId);
  }

  @Patch(':appId')
  async updateApp(@Param('appId') appId: string, @Body() updateAppDto: any) {
    // @note: This action updates app for given appId;
    return this.appsService.updateApp(appId, updateAppDto);
  }

  @Post(':appId/rule')
  async createAppRule(
    @Param('appId') appId: string,
    @Body()
    createAppRuleDto: {
      ruleId: string;
      data: string[];
    },
  ) {
    // @note: This action creates app rule given appId;
    return this.appsService.createAppRule(appId, createAppRuleDto);
  }

  @Patch(':appId/rule/:ruleId')
  async updateAppRule(
    @Param('appId') appId: string,
    @Param('ruleId') ruleId: string,
    @Body() updateAppRuleDto: string[],
  ) {
    // @note: This action updates app rule for given appId and ruleId;
    return this.appsService.updateAppRule(appId, ruleId, updateAppRuleDto);
  }

  @Delete(':appId/rule/:ruleId')
  async deleteAppRule(
    @Param('appId') appId: string,
    @Param('ruleId') ruleId: string,
  ) {
    // @note: This action deletes app rule for given appId and ruleId;
    return this.appsService.deleteAppRule(appId, ruleId);
  }

  @Patch(':appId/rules')
  async batchUpdateAppRules(
    @Param('appId') appId: string,
    @Body() updateRulesDto: { ruleId: string; data: string[] }[],
  ) {
    // @note: This action updates app rules in bulk for given appId;
    return this.appsService.batchUpdateAppRules(appId, updateRulesDto);
  }

  @Put(':appId/secret')
  async updateAppSecret(@Param('appId') appId: string) {
    // @note: This action updates app secret for given appId;
    return this.appsService.updateSecretKeyRule(appId, 'generate');
  }

  @Delete(':appId/secret')
  async deleteAppSecret(@Param('appId') appId: string) {
    // @note: This action deletes app secret for given appId;
    return this.appsService.updateSecretKeyRule(appId, 'delete');
  }
}
