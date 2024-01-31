import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '.generated/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async countAll(): Promise<number> {
    // return 'From Service ' + randomUUID();
    const count = await this.prisma.client.tenant.count();
    return count;
  }

  async create(): Promise<any> {
    const secretKey = randomBytes(8).toString('hex');
    const hashedKey = bcrypt.hash(
      secretKey,
      process.env.SALT || bcrypt.genSaltSync(10),
    );
    const tenant = await this.prisma.client.tenant.create({
      data: {
        active: true,
        secretKey: await hashedKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    if (!tenant) throw new Error('Unable to create tenant');
    return { secret: secretKey };
  }

  async addCredits(): Promise<any> {
    // TODO- Add credits to tenant
    return 'Add credits to tenant';
  }

  async validateTenant(): Promise<any> {
    // TODO- Validate tenant
    return 'Validate tenant';
  }

  async getTenantBySecret(): Promise<any> {
    // TODO- Get tenant
    return 'Get tenant by Secret';
  }
}
