import {
  ConflictException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { sealData, unsealData } from 'iron-session';
import { SiweMessage, generateNonce, SiweErrorType } from 'siwe';

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
    const { address, chainId } = await unsealData<ISession>(
      sessionCookie,
      SESSION_OPTIONS,
    );
    return { address, chainId };
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
    try {
      const siweMessage = new SiweMessage(message);
      const { data: fields } = await siweMessage.verify({
        signature,
        nonce: nonce,
      });

      if (fields.nonce !== nonce) {
        return new ConflictException('Invalid Nonce');
      }

      const session: ISession = {
        nonce: fields?.nonce,
        chainId: fields?.chainId,
        address: fields?.address,
      };

      const cookie = await sealData(session, SESSION_OPTIONS);
      return cookie;
    } catch (error) {
      switch (error) {
        case SiweErrorType.INVALID_NONCE:
        case SiweErrorType.INVALID_SIGNATURE:
          return new NotAcceptableException(`Couldn't verify signature`);

        default:
          return;
      }
    }
  }

  getNonce() {
    return generateNonce();
  }
}
