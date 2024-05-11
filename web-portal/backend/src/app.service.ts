import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';

@Injectable()
export class AppService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  getHello(): string {
    return this.prisma.client.tenant.findMany().toString();
  }
}
