import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { TenantModule } from './tenant/tenant.module';
import { AppController } from './app.controller';
import { AuthkeysModule } from './authkeys/authkeys.module';
import { SiweModule } from './siwe/siwe.module';

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
    AuthkeysModule,
    SiweModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
