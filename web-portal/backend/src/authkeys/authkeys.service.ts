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

  salt = process.env.KEYS_SALT ?? `$2b$10$6Cib00sYjzfn8jnXGFR32e`; // todo- remove this temp salt and throw error when no salt in env on startup

  async createAuthKey(tenantId: string, name: string): Promise<any> {
    const secretKey = 'sk_' + randomBytes(58).toString('hex'); // <-- todo- figure out final key format

    const hashedKey = await bcrypt.hash(secretKey, this.salt);

    const key = this.prisma.client.tenantAuthKey.create({
      data: {
        appId: name,
        active: true,
        tenantId: tenantId,
        keyValue: hashedKey,
      },
    });
    if (!key) throw new Error(`Couldn't create new key!`);

    return key;
  }
}
