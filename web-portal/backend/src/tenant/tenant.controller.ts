import { Controller, Get } from '@nestjs/common';
// import { randomUUID } from 'crypto';

import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Get('count')
  generateTenant() {
    console.log('This action returns a count of total tenants');
    return this.tenantService.countAll();
  }
  @Get('create')
  createTenant() {
    console.log('This action creates a new tenant');
    return this.tenantService.create();
  }
}
