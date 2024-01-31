import { Controller, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Controller('tenant')
export class TenantController {
  @Get('generate')
  generateTenant() {
    console.log('This action returns a new tenant');
    return randomUUID();
  }
}
