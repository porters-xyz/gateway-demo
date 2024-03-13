import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { createHash } from 'crypto';
import { TenantService } from '../tenant/tenant.service';
@Injectable()
export class UserService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
    private tenantService: TenantService,
  ) {}

  async getOrCreate(ethAddress: string) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: {
        ethAddress: createHash('sha256').update(ethAddress).digest('hex'),
      },
      include: {
        orgs: {
          include: {
            _count: true,
          },
        },
      },
    });

    if (!existingUser || existingUser?.orgs?.length === 0) {
      // @note: this will generate enterprise + tenant before creating a new user;
      const { enterpriseId, secret } = await this.tenantService.create(); // <- show this secret for the first time user to backup

      if (!enterpriseId) {
        throw new HttpException(
          'Unable to create tenant',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (existingUser) {
        const updateExistingUser = await this.prisma.client.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            orgs: {
              create: {
                enterprise: {
                  connect: {
                    id: enterpriseId,
                  },
                },
              },
            },
          },

          include: {
            orgs: {
              include: {
                _count: true,
              },
            },
          },
        });
        const { id, active, createdAt, orgs } = updateExistingUser;
        return { id, active, createdAt, orgs };
      }
      const newUser = await this.prisma.client.user.create({
        data: {
          ethAddress: createHash('sha256').update(ethAddress).digest('hex'),
          orgs: {
            create: {
              enterprise: {
                connect: {
                  id: enterpriseId,
                },
              },
            },
          },
        },
        include: {
          orgs: {
            include: {
              _count: true,
            },
          },
        },
      });

      if (!newUser)
        throw new HttpException(
          'Unable to create tenant',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const { id, active, createdAt, orgs } = newUser;

      return { id, active, createdAt, secret, orgs };
    }

    const { id, active, createdAt, orgs } = existingUser;
    return { id, active, createdAt, orgs };
  }
}
