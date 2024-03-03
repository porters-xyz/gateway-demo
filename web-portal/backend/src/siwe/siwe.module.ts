import { Module } from '@nestjs/common';
import { SiweController } from './siwe.controller';
import { SiweService } from './siwe.service';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';

@Module({
  controllers: [SiweController],
  providers: [SiweService, UserService, TenantService],
})
export class SiweModule {}
