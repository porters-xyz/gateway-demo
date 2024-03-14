import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService, UserService, TenantService],
})
export class AppsModule {}
