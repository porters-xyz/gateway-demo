import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient, TransactionType } from '../../../../.generated/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async countAll(): Promise<number> {
    const count = await this.prisma.client.tenant.count();
    return count;
  }

  async create(): Promise<any> {
    const secretKey = randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt();

    const hashedKey = await bcrypt.hash(secretKey, salt);

    const tenant = await this.prisma.client.tenant.create({
      data: {
        active: true,
        secretKey: `${hashedKey}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    if (!tenant) throw new Error('Unable to create tenant');
    return { secret: secretKey };
  }

  async validateTenant(rawKey: string): Promise<any> {
    const allTenants = await this.prisma.client.tenant.findMany();

    for (const tenant of allTenants) {
      const isKeyValid = await bcrypt.compare(rawKey, tenant.secretKey);
      if (isKeyValid) {
        return { valid: true, id: tenant.id };
      }
    }

    return { valid: false, id: null, message: 'Invalid secret key' };
  }

  async getTenantById(id: string): Promise<any> {
    const tenant = await this.prisma.client.tenant.findUnique({
      where: {
        id: id,
      },
    });

    if (!tenant) throw new Error('No tenant exists with such id!');

    return {
      id: tenant.id,
      active: tenant.active,
      createdAt: tenant.createdAt,
    };
  }

  async addCredits(id: string): Promise<any> {
    const tenantExists = await this.getTenantById(id);
    if (!tenantExists) throw new Error('No tenant exists with such id!');

    const appliedCredits = await this.prisma.client.paymentLedger.create({
      data: {
        tenantId: id,
        referenceId: randomBytes(8).toString('hex'),
        amount: 1000,
        transactionType: TransactionType.CREDIT,
      },
    });

    if (!appliedCredits) throw new Error('Unable to apply credits to tenant');

    return appliedCredits;
  }
}
