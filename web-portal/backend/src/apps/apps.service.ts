import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { UserService } from '../user/user.service';
@Injectable()
export class AppsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
    private userService: UserService,
  ) {}

  async getTenantsByUser(userAddress: string) {
    const user = await this.userService.getOrCreate(userAddress);

    const enterprises = user.orgs.map((org) => org.enterpriseId);

    const tenants = await this.prisma.client.tenant.findMany({
      where: {
        enterpriseId: {
          in: enterprises,
        },
      },
    });

    if (!tenants || tenants.length === 0) {
      throw new HttpException('No tenants found', HttpStatus.NOT_FOUND);
    }
    return tenants;
  }

  async getAppsByUser(userAddress: string) {
    const tenants = await this.getTenantsByUser(userAddress);
    const apps = await this.prisma.client.app.findMany({
      where: {
        tenantId: {
          in: tenants.map((tenant) => tenant.id),
        },
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

  async createApp(
    userAddress: string,
    name: string,
    description: string | null | undefined,
  ) {
    const tenants = await this.getTenantsByUser(userAddress);

    if (!tenants) return;
    const newApp = await this.prisma.client.app.create({
      data: {
        tenantId: tenants[0].id,
        name,
        description,
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
