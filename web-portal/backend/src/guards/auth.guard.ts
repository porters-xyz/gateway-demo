import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core'
import { unsealData } from 'iron-session';
import { ISession, SESSION_OPTIONS, SiweService } from '../siwe/siwe.service';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator'
import { AppsService } from '../apps/apps.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly siweService: SiweService,
    private readonly appsService: AppsService,
    private readonly reflector: Reflector
  ) { }
  async canActivate(context: ExecutionContext) {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])


    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const sessionCookie = request.cookies?.session;

    // read params
    const tenantIdFromParams = request.params['tenantId']
    const appIdFromParams = request.params['appId']

    if (!sessionCookie) {
      return false;
    }

    const { address, chainId } = await unsealData<ISession>(
      sessionCookie,
      SESSION_OPTIONS,
    );

    // no address or chainId
    if (!address || !chainId) return false;


    const session = await this.siweService.getSession(sessionCookie)

    // fail if no session
    if (!session) return false

    // verify appId access
    if (appIdFromParams) {
      const hasAccessToAppId = await this.appsService.verifyAppAccess(request, appIdFromParams);
      if (!hasAccessToAppId) return false
    }

    // verify tenantId access
    if (tenantIdFromParams) {
      if (tenantIdFromParams !== session?.tenantId) { return false }
    }

    return true;
  }
}
