import { Controller, Put, Query, Param } from '@nestjs/common';
import { AuthkeysService } from './authkeys.service';

@Controller('authkeys')
export class AuthkeysController {
  constructor(private readonly authKeyService: AuthkeysService) {}

  @Put(':tenantId/create')
  async applyCredits(
    @Param('tenantId') tenantId: string,
    @Query('name') name: string,
  ): Promise<any> {
    console.log('This action creates api/auth key for the provided tenant Id');
    return this.authKeyService.createAuthKey(tenantId, name);
  }
}
