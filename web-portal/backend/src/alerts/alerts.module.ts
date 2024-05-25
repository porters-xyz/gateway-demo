import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

@Module({
  providers: [AlertsService],
  controllers: [AlertsController]
})
export class AlertsModule {}
