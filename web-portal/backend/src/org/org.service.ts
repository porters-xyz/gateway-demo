import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';

@Injectable()
export class OrgService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async getOrgsByUser(userId: string) {
    const org = this.prisma.client.org.findMany({
      where: {
        users: {
          every: {
            id: userId,
          },
        },
      },
    });
  }
}
