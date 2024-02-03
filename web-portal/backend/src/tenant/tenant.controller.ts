import { Controller, Get, Post, Put, Param, Query } from '@nestjs/common';

import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('count')
  async generateTenant(): Promise<any> {
    console.log('This action returns a count of total tenants');
    return this.tenantService.countAll();
  }

  @Post('create')
  async createTenant(): Promise<any> {
    console.log('This action creates a new tenant');
    return this.tenantService.create();
  }

  @Get(':key/validate')
  async validateTenant(@Param('key') key: string): Promise<any> {
    console.log('This action checks validity of provided key');
    const validation = await this.tenantService.validateTenant(key);
    return validation;
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string): Promise<any> {
    console.log('This action returns a tenant by its id');
    return this.tenantService.getTenantById(id);
  }

  @Put(':id/applyCredits')
  async applyCredits(
    @Param('id') id: string,
    @Query('amount') amount: number,
  ): Promise<any> {
    // TODO- Remove this endpoint as its temporary
    console.log('This action applies free credits to a tenant');
    return this.tenantService.addCredits(id, amount);
  }
}
