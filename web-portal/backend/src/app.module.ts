import { APP_GUARD } from '@nestjs/core'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { TenantModule } from './tenant/tenant.module';
import { AppController } from './app.controller';
import { SiweModule } from './siwe/siwe.module';
import { UserModule } from './user/user.module';
import { AppsModule } from './apps/apps.module';
import { OrgModule } from './org/org.module';
import { UtilsModule } from './utils/utils.module';
import { UsageModule } from './usage/usage.module';
import { SiweService } from './siwe/siwe.service';
import { AuthGuard } from './guards/auth.guard';
import { AppsService } from './apps/apps.service';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    CustomPrismaModule.forRoot({
      name: 'Postgres',
      client: new PrismaClient(),
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      envFilePath: ['@/.env', '.env.local'],
    }),
    TenantModule,
    SiweModule,
    UserModule,
    AppsModule,
    OrgModule,
    UtilsModule,
    UsageModule,
    AlertsModule
  ],
  providers: [
    SiweService,
    AppsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
  controllers: [AppController],
})
export class AppModule { }
