import { Injectable, HttpStatus } from '@nestjs/common';
import { sealData, unsealData } from 'iron-session';
import { SiweErrorType, SiweMessage } from 'siwe';

interface ISession {
  nonce?: string;
  chainId?: number;
  address?: string;
}

const SESSION_OPTIONS = {
  ttl: 60 * 60, // 1 hour
  password: process.env.SESSION_SECRET!,
};

@Injectable()
export class SiweService {
  async getSessionFromCookie(sessionCookie: string) {
    return await unsealData<ISession>(sessionCookie, SESSION_OPTIONS);
  }

  async verifyMessage({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) {
    const siweMessage = new SiweMessage(message);
    return await siweMessage.verify({ signature });
  }

  async nonce() {
    // TODO
  }

  async signOut() {
    // TODO
  }
}
