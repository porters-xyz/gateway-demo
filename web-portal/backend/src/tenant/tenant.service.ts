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

  salt = process.env.SALT ?? `$2b$10$6Cib00sYjzfn8jnXGFR32e`; // TODO: remove this temp salt and throw error when no salt in env on startup

  async countAll(): Promise<number> {
    const count = await this.prisma.client.tenant.count();
    return count;
  }

  async create(): Promise<any> {
    const secretKey = randomBytes(8).toString('hex');
    const hashedKey = await bcrypt.hash(secretKey, this.salt);

    const tenant = await this.prisma.client.tenant.create({
      data: {
        active: true,
        secretKey: hashedKey,
      },
    });
    if (!tenant) throw new Error('Unable to create tenant');
    return { secret: secretKey };
  }

  async validateTenant(rawKey: string): Promise<any> {
    const hashedKey = await bcrypt.hash(rawKey, this.salt);
    const tenant = await this.prisma.client.tenant.findUnique({
      where: {
        secretKey: hashedKey,
      },
    });

    if (!tenant)
      return { valid: false, id: null, message: 'Invalid secret key' };

    return { valid: true, id: tenant.id };
  }

  async getTenantById(id: string): Promise<any> {
    // todo: add jwt/guard to this
    const tenant = await this.prisma.client.tenant.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        keys: {
          select: {
            id: true,
            appId: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!tenant) throw new Error('No tenant exists with such id!');

    return tenant;
  }

  async addCredits(id: string, amount: number): Promise<any> {
    const tenantExists = await this.getTenantById(id);
    if (!tenantExists) throw new Error('No tenant exists with such id!');

    const appliedCredits = await this.prisma.client.paymentLedger.create({
      data: {
        tenantId: id,
        referenceId: randomBytes(8).toString('hex'),
        transactionType: TransactionType.CREDIT,
        amount,
      },
    });

    if (!appliedCredits) throw new Error('Unable to apply credits to tenant');

    return appliedCredits;
  }
}
