import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UtilsService } from './utils.service';

@Controller('utils')
@UseGuards(AuthGuard)
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get()
  async getChains() {
    // @note: This action checks validity of provided key
    const validation = await this.utilsService.getChains();
    return validation;
  }
}
