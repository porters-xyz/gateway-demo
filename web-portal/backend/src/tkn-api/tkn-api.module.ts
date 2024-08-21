import { Module } from '@nestjs/common';
import { TknApiController } from './tkn-api.controller';

@Module({
  controllers: [TknApiController],
  providers: [],
})
export class TknApiModule {}
