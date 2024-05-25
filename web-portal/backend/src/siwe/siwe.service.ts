import {
  ConflictException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { sealData, unsealData } from 'iron-session';
import { SiweMessage, generateNonce } from 'siwe';
import { UserService } from '../user/user.service';
export interface ISession {
  nonce?: string;
  chainId?: number;
  address?: string;
}

export const SESSION_OPTIONS = {
  password:
    process.env.SESSION_SECRET! ?? `NNb774sZ7bNnGkWTwkXE3T9QWCAC5DkY0HTLz`, // TODO: get via env vars only
};

@Injectable()
export class SiweService {
  constructor(private readonly userService: UserService) { }

  async getSession(sessionCookie: string) {
    const { address, chainId } = await unsealData<ISession>(
      sessionCookie,
      SESSION_OPTIONS,
    );

    if (address) {
      // @note: create or get user if a valid session is found
      const user = await this.userService.getOrCreate(address);
      return { chainId, address, ...user };
    }

    return null;
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
      const { data: fields } = await siweMessage.verify({ signature, nonce });

      if (fields.nonce !== nonce) {
        throw new ConflictException('Invalid Nonce');
      }

      const session: ISession = {
        nonce: fields?.nonce,
        chainId: fields?.chainId,
        address: fields?.address,
      };

      const cookie = await sealData(session, SESSION_OPTIONS);
      return cookie;
    } catch (error) {
      return new NotAcceptableException(error);
    }
  }

  getNonce() {
    return generateNonce();
  }
}
