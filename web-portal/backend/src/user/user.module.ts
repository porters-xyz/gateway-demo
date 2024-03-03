import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TenantService } from '../tenant/tenant.service';

@Module({
  providers: [UserService, TenantService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
