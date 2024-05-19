import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Patch,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AppsService } from './apps.service';
import { Delete } from '@nestjs/common';
import { UserService } from '../user/user.service';

// TODO: create a centralised interface file?
interface CreateAppDto {
  name: string;
  description?: string;
}

@Controller('apps')
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
    private readonly userService: UserService) { }

  @Get()
  async getUserApps(@Req() req: Request) {
    // @note: This action fetches apps by userAddress retrieved from cookie;
    const userAddress = await this.userService.getUserAddress(req);
    return this.appsService.getAppsByUser(userAddress);
  }

  @Post()
  async createApp(
    @Req() req: Request,
    @Body() createAppDto: CreateAppDto,
  ) {
    // @note: This action creates app for retrived userAddress from cookie;
    const userAddress = await this.userService.getUserAddress(req);
    const { name, description } = createAppDto;
    return this.appsService.createApp(userAddress, name, description);
  }

  @Delete(':appId')
  async deleteApp(
    @Req() req: Request,
    @Param('appId') appId: string) {
    // @note: This action deletes app for given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.deleteApp(appId);
  }

  @Patch(':appId')
  async updateApp(
    @Req() req: Request,
    @Param('appId') appId: string, @Body() updateAppDto: any) {
    // @note: This action updates app for given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.updateApp(appId, updateAppDto);
  }

  @Post(':appId/rule')
  async createAppRule(
    @Req() req: Request,
    @Param('appId') appId: string,
    @Body()
    createAppRuleDto: {
      ruleName: string;
      data: string[];
    },
  ) {
    // @note: This action creates app rule given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.createAppRule(appId, createAppRuleDto.ruleName, createAppRuleDto.data);
  }

  @Patch(':appId/rule/:ruleName')
  async updateAppRule(
    @Req() req: Request,
    @Param('appId') appId: string,
    @Param('ruleName') ruleName: string,
    @Body() updateAppRuleDto: string[],
  ) {
    // @note: This action updates app rule for given appId and ruleName;

    return this.appsService.updateAppRule(appId, ruleName, updateAppRuleDto);
  }

  @Delete(':appId/rule/:ruleName')
  async deleteAppRule(
    @Req() req: Request,
    @Param('appId') appId: string,
    @Param('ruleName') ruleName: string,
  ) {
    // @note: This action deletes app rule for given appId and ruleName;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.deleteAppRule(appId, ruleName);
  }

  @Patch(':appId/rules')
  async batchUpdateAppRules(
    @Req() req: Request,
    @Param('appId') appId: string,
    @Body() updateRulesDto: { ruleName: string; data: string[] },
  ) {
    // @note: This action updates app rules in bulk for given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.batchUpdateAppRules(appId, updateRulesDto.ruleName, updateRulesDto.data);
  }

  @Put(':appId/secret')
  async updateAppSecret(
    @Req() req: Request,
    @Param('appId') appId: string) {
    // @note: This action updates app secret for given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.updateSecretKeyRule(appId, 'generate');
  }

  @Delete(':appId/secret')
  async deleteAppSecret(
    @Req() req: Request,
    @Param('appId') appId: string) {
    // @note: This action deletes app secret for given appId;
    await this.appsService.verifyAppAccess(req, appId)
    return this.appsService.updateSecretKeyRule(appId, 'delete');
  }
}
