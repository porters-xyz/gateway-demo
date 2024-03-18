import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { unsealData } from 'iron-session';
import { ISession, SESSION_OPTIONS } from '../siwe/siwe.service';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const sessionCookie = request.cookies?.session;

      if (!sessionCookie) {
        throw new HttpException(
          'Unauthorized: Session cookie not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { address, chainId } = await unsealData<ISession>(
        sessionCookie,
        SESSION_OPTIONS,
      );

      if (!address || !chainId) {
        throw new HttpException(
          'Unauthorized: Invalid session data',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
