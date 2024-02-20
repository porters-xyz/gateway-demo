import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { sealData, unsealData } from 'iron-session';
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
  }

  async verifyMessage({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) {
    const siweMessage = new SiweMessage(message);

    const session: ISession = {
      // create session with nonce, address, chainId
    }

    try {
      const { data } = await siweMessage.verify({ signature, session.nonce });
      if (data.nonce != session.nonce) {
        throw new HttpException('Invalid Nonce', HttpStatus.UNPROCESSABLE_ENTITY)
      }
    }
    catch (error) {
      switch (error) {
        case SiweErrorType.INVALID_NONCE:
        case SiweErrorType.INVALID_SIGNATURE:
          throw new HttpException(String(error), HttpStatus.UNPROCESSABLE_ENTITY)
        default:
          throw new HttpException(String(error), HttpStatus.BAD_REQUEST)
      }
    }

    const sessionCookie = await sealData(session, SESSION_OPTIONS)

    return sessionCookie;
  }

  getNonce() {
    return generateNonce();
  }

  async signOut() {
    // TODO delete cookie @Note: maybe just handle in nextjs action
  }
}
