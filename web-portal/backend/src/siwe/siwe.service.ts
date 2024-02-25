import { Injectable } from '@nestjs/common';
import { sealData, unsealData } from 'iron-session';
import { SiweMessage, generateNonce } from 'siwe';

interface ISession {
  nonce?: string;
  chainId?: number;
  address?: string;
}

const SESSION_OPTIONS = {
  ttl: 60 * 60, // 1 hour
  password:
    process.env.SESSION_SECRET! ?? `NNb774sZ7bNnGkWTwkXE3T9QWCAC5DkY0HTLz`, // TODO: get via env vars only
};

@Injectable()
export class SiweService {
  async getSession(sessionCookie: string) {
    return await unsealData<ISession>(sessionCookie, SESSION_OPTIONS);
  }

  async verifyMessage({
    message,
    signature,
    nonce,
  }: {
    message: string;
    signature: string;
    nonce: string;
  }) {
    const siweMessage = new SiweMessage(message);

    const { data } = await siweMessage.verify({ signature, nonce });

    const session: ISession = {
      nonce: data?.nonce,
      chainId: data?.chainId,
      address: data?.address,
    };

    const cookie = await sealData(session, SESSION_OPTIONS);
    return data?.nonce === nonce ? cookie : false;
  }

  getNonce() {
    return generateNonce();
  }

  async signOut() {
    // TODO delete cookie @Note: maybe just handle in nextjs action
  }
}
