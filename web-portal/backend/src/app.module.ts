import { Module } from '@nestjs/common';
import { AppService } from './app.service';
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
import { ScheduleModule } from '@nestjs/schedule';

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
    ScheduleModule.forRoot(),
    TenantModule,
    SiweModule,
    UserModule,
    AppsModule,
    OrgModule,
    UtilsModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
