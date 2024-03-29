import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';

@Injectable()
export class UtilsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async getChains() {
    const chains = this.prisma.client.products.findMany();

    if (!chains)
      throw new HttpException(
        'No Chains/Services Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return chains;
  }
}
