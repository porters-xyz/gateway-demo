import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
@Injectable()
export class AppsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async getAppsByTenant(tenantId: string) {
    const apps = await this.prisma.client.app.findMany({
      where: {
        tenantId,
      },
      include: {
        appRules: true,
      },
    });

    if (!apps || apps?.length === 0) {
      throw new HttpException('No apps found', HttpStatus.NOT_FOUND);
    }
    return apps;
  }

  async createApp(tenantId: string) {
    const Tenant = await this.prisma.client.tenant.findFirst({
      where: {
        id: tenantId,
      },
    });
    if (!Tenant) return;
    const newApp = await this.prisma.client.app.create({
      data: {
        tenantId,
      },
    });

    if (!newApp) {
      return new HttpException(
        `Could not create app for this tenant`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return newApp;
  }
}
