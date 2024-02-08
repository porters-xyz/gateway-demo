import { Controller, Post, Param } from '@nestjs/common';
import { AuthkeysService } from './authkeys.service';

@Controller('tenant')
export class AuthkeysController {
  constructor(private readonly authKeyService: AuthkeysService) {}

  @Post(':tenantId/authkey')
  async createAuthKey(@Param('tenantId') tenantId: string): Promise<any> {
    console.log('This action creates api/auth key for the provided tenant Id');

    return this.authKeyService.createAuthKey(tenantId);
  }
}
