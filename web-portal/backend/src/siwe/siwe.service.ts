import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { unsealData } from 'iron-session';
import { SiweErrorType, SiweMessage, generateNonce } from 'siwe';

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
  async getSession(sessionCookie: string) {
    return await unsealData<ISession>(sessionCookie, SESSION_OPTIONS);
    //TODO:  create new session otherwise?
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

    // console.log(data.nonce, nonce);

    return data?.nonce === nonce ? true : false;
  }

  getNonce() {
    return generateNonce();
  }

  async signOut() {
    // TODO delete cookie @Note: maybe just handle in nextjs action
  }
}
