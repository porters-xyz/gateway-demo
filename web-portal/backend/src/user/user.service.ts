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
    });

    if (!existingUser) {
      const newUser = await this.prisma.client.user.create({
        data: {
          ethAddress: createHash('sha256').update(ethAddress).digest('hex'),
        },
      });

      if (!newUser)
        throw new HttpException(
          'Unable to create tenant',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      // @note: this will generate user-tied tenant and enterprise for the given user;
      const { secret } = await this.tenantService.create(); // <- show this secret for the first time user to backup
      const { id, active, createdAt } = newUser;

      return { id, active, createdAt, secret };
    }

    const { id, active, createdAt } = existingUser;
    return { id, active, createdAt };
  }
}
