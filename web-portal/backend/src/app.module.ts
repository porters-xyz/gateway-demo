import { Module } from '@nestjs/common';
import { AppService } from './app.service';

import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '../../../.generated/client';
import { TenantModule } from './tenant/tenant.module';
import { AppController } from './app.controller';
import { AuthkeysModule } from './authkeys/authkeys.module';

@Module({
  imports: [
    CustomPrismaModule.forRoot({
      name: 'Postgres',
      client: new PrismaClient(),
      isGlobal: true,
    }),
    TenantModule,
    AuthkeysModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
