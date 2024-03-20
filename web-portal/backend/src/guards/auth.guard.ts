import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { unsealData } from 'iron-session';
import { ISession, SESSION_OPTIONS } from '../siwe/siwe.service';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const sessionCookie = request.cookies?.session;

    if (!sessionCookie) {
      return false;
    }

    const { address, chainId } = await unsealData<ISession>(
      sessionCookie,
      SESSION_OPTIONS,
    );

    if (!address || !chainId) return false;

    return true;
  }
}
