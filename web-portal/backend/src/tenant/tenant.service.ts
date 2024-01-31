import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '.generated/client';
import { randomUUID } from 'crypto';

@Injectable()
export class TenantService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async findAll(): Promise<number> {
    // return 'From Service ' + randomUUID();
    const count = await this.prisma.client.tenant.count();
    return count;
  }

  async create(): Promise<any> {
    const tenant = await this.prisma.client.tenant.create({
      data: {
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return tenant;
  }
}
