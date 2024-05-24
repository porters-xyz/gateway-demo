import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { createHash, randomBytes } from 'crypto';
import { nanoid } from 'nanoid'
import { NANO_ID_LENGTH } from '../utils/const';

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
        id: nanoid(NANO_ID_LENGTH),
        enterpriseId: enterprise.id,
        secretKey: hashedKey,
      },
    });
    if (!tenant)
      throw new HttpException(
        'Unable to create tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return { secret: secretKey, enterpriseId: enterprise.id };
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
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        enterpriseId: true,
        Enterprise: {
          select: {
            id: true,
            _count: true,
            active: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
            orgs: {
              select: {
                id: true,
                _count: true,
                active: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
                enterpriseId: true,
                users: {
                  select: {
                    id: true,
                    active: true,
                    deletedAt: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
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

  async getTenantBillingHistory(tenantId: string) {
    const billingHistory = await this.prisma.client.paymentLedger.findMany({
      where: {
        tenantId,
      },
    });

    if (!billingHistory) return [];

    return billingHistory;
  }
}
