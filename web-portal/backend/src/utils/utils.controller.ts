import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UtilsService } from './utils.service';

@Controller('utils')
@UseGuards(AuthGuard)
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('endpoints')
  async getChains() {
    // @note: This action checks validity of provided key
    const validation = await this.utilsService.getChains();
    return validation;
  }

  @Get('ruletypes')
  async getRuleTypes() {
    const ruleTypes = await this.utilsService.getRuleTypes();
    return ruleTypes;
  }
}