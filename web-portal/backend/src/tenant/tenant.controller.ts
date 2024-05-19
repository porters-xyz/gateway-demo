import { Controller, Get, Post, Param, Query } from '@nestjs/common';

import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

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

  @Get(':tenantId')
  async getTenantById(@Param('tenantId') tenantId: string) {
    // @note: This action returns a tenant by its id
    return this.tenantService.getTenantById(tenantId);
  }

  @Get(':tenantId/billing')
  async getTenantBillingHistory(@Param('tenantId') tenantId: string) {
    // @note: This action returns billing history for a tenant
    return this.tenantService.getTenantBillingHistory(tenantId);
  }
}
