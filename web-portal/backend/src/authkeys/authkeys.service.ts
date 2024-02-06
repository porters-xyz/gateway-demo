import { Injectable, Inject } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '../../../../.generated/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthkeysService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

  salt = process.env.KEYS_SALT ?? `$2b$10$6Cib00sYjzfn8jnXGFR32e`; // TODO: remove this temp salt and throw error when no salt in env on startup

  async createAuthKey(tenantId: string): Promise<any> {
    const secretKey = 'sk_' + randomBytes(58).toString('hex'); // <-- TODO: figure out final key format

    const hashedKey = await bcrypt.hash(secretKey, this.salt);

    const key = this.prisma.client.tenantAuthKey.create({
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
