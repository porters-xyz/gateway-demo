import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';

import { TenantService } from './tenant.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('tenant')
@UseGuards(AuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async createTenant() {
    // @note: This action creates a new tenant
    return this.tenantService.create();
  }

  @Get()
  async validateTenant(@Query('key') key: string) {
    // @note: This action checks validity of provided key
    const validation = await this.tenantService.validateTenant(key);
    return validation;
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string) {
    // @note: This action returns a tenant by its id
    return this.tenantService.getTenantById(id);
  }

  @Post(':id/credits')
  async applyCredits(@Param('id') id: string, @Query('amount') amount: string) {
    // TODO: Remove this endpoint as its temporary
    // @note: 'This action applies free credits to a tenant'
    return this.tenantService.addCredits(id, Number(amount));
  }
}
