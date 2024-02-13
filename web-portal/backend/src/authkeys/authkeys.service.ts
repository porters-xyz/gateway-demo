import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthkeysService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  async createAuthKey(tenantId: string): Promise<any> {
    const secretKey = 'sk_' + randomBytes(39).toString('hex'); // <-- TODO: figure out final key format

    const hashedKey = createHash('sha256').update(secretKey).digest('hex');

    const key = await this.prisma.client.tenantAuthKey.create({
      data: {
        appId: randomBytes(16).toString('hex'), // TODO: this will be id for the app later
        active: true,
        tenantId: tenantId,
        keyValue: hashedKey,
      },
    });

    if (!key) throw new Error(`Couldn't create new key!`);

    return { secretKey };
  }
}
