import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient, TransactionType } from '@/.generated/client';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async create() {
    const secretKey = randomBytes(8).toString('hex');
    const hashedKey = createHash('sha256').update(secretKey).digest('hex');

    const enterprise = await this.prisma.client.enterprise.create({
      data: {},
    });

    if (!enterprise.id)
      throw new HttpException(
        'Unable to create tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const tenant = await this.prisma.client.tenant.create({
      data: {
        enterpriseId: enterprise.id,
        secretKey: hashedKey,
      },
    });
    if (!tenant)
      throw new HttpException(
        'Unable to create tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return { secret: secretKey };
  }

  async validateTenant(rawKey: string) {
    const hashedKey = createHash('sha256').update(rawKey).digest('hex');
    const tenant = await this.prisma.client.tenant.findUnique({
      where: {
        secretKey: hashedKey,
      },
    });

    if (!tenant)
      throw new HttpException(
        'No tenant found with provided key',
        HttpStatus.NOT_FOUND,
      );

    return { valid: true, id: tenant.id };
  }

  async getTenantById(id: string) {
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
        apps: {
          select: {
            id: true,
            _count: true,

            appRules: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        enterpriseId: true,
        Enterprise: {
          select: {
            id: true,
            _count: true,
            enabled: true,
          },
        },
      },
    });

    if (!tenant)
      throw new HttpException(
        'No tenant exists with such id!',
        HttpStatus.NOT_FOUND,
      );

    return tenant;
  }

  async addCredits(id: string, amount: number) {
    const tenantExists = await this.getTenantById(id);
    if (!tenantExists)
      throw new HttpException(
        'No tenant exists with such id!',
        HttpStatus.NOT_FOUND,
      );

    const appliedCredits = await this.prisma.client.paymentLedger.create({
      data: {
        tenantId: id,
        referenceId: randomBytes(8).toString('hex'),
        transactionType: TransactionType.CREDIT,
        amount: amount,
      },
    });

    if (!appliedCredits)
      throw new HttpException(
        'Unable to apply credits to tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return true;
  }
}
