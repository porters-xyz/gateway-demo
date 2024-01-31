import { Module } from '@nestjs/common';
import { AppService } from './app.service';

import { CustomPrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '../../../.generated/client';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    CustomPrismaModule.forRoot({
      name: 'Postgres',
      client: new PrismaClient(),
    }),
    TenantModule,
  ],
  providers: [AppService],
})
export class AppModule {}
