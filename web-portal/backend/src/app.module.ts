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
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
