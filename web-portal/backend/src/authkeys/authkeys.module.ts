import { Module } from '@nestjs/common';
import { AuthkeysController } from './authkeys.controller';
import { AuthkeysService } from './authkeys.service';

@Module({
  controllers: [AuthkeysController],
  providers: [AuthkeysService],
})
export class AuthkeysModule {}
