import { Controller, Get, Param } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertsService) { }
  @Get('app/:appId')
  async getAppAlerts(@Param('appId') appId: string) {
    return this.alertService.getAppAlerts(appId)
  }
  @Get('tenant/:tenantId')
  async getTenantAlerts(@Param('appId') tenantId: string) {
    return this.alertService.getTenantAlerts(tenantId)
  }
}
