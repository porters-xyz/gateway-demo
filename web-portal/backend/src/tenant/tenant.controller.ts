import { Controller, Get, Post, Param, Query } from '@nestjs/common';

import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async createTenant() {
    console.log('This action creates a new tenant');
    return this.tenantService.create();
  }

  @Get()
  async validateTenant(@Query('key') key: string) {
    console.log('This action checks validity of provided key');
    return this.tenantService.validateTenant(key);
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string) {
    console.log('This action returns a tenant by its id');
    return this.tenantService.getTenantById(id);
  }

  @Post(':id/credits')
  async applyCredits(@Param('id') id: string, @Query('amount') amount: number) {
    // TODO: Remove this endpoint as its temporary
    console.log('This action applies free credits to a tenant');
    return this.tenantService.addCredits(id, amount);
  }
}
