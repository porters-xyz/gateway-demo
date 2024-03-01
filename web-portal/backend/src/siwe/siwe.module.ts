import { Module } from '@nestjs/common';
import { SiweController } from './siwe.controller';
import { SiweService } from './siwe.service';

@Module({
  controllers: [SiweController],
  providers: [SiweService],
})
export class SiweModule {}
