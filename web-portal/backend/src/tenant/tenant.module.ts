import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';

@Module({
  controllers: [TenantController],
})
export class TenantModule {}
