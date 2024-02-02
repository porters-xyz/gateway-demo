import { Controller, Get, Param } from '@nestjs/common';

import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('count')
  async generateTenant(): Promise<any> {
    console.log('This action returns a count of total tenants');
    return this.tenantService.countAll();
  }

  @Get('create')
  async createTenant(): Promise<any> {
    console.log('This action creates a new tenant');
    return this.tenantService.create();
  }

  @Get('validate/:key')
  async validateTenant(@Param('key') key: string): Promise<any> {
    const validation = await this.tenantService.validateTenant(key);
    return validation;
  }

  @Get('/:id')
  async getTenantById(@Param('id') id: string): Promise<any> {
    console.log('This action returns a tenant by its id');
    return this.tenantService.getTenantById(id);
  }
}
