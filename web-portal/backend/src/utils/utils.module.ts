import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';

@Module({
  controllers: [UtilsController],
  providers: [UtilsService]
})
export class UtilsModule {}
