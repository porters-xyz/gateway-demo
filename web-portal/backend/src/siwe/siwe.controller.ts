import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { SiweService } from './siwe.service';
import { Request, Response } from 'express';
@Controller('siwe')
export class SiweController {
  constructor(private readonly siweService: SiweService) {}

  @Get()
  async getSession(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    console.log('Get Session from cookie using siwe');
    const sessionCookie = request?.cookies?.get('session')?.value ?? null;
    if (!sessionCookie) {
      return response.status(HttpStatus.BAD_REQUEST).send(false);
    }
    return this.siweService.getSession(sessionCookie);
  }

  @Post()
  async verifyMessage(@Req() request: Request, @Res() response: Response) {
    console.log('Verify ownership using siwe');
    const { message, signature } = request.body;

    const nonceRegex = /Nonce: (\S+)/;
    const nonce = message.match(nonceRegex)[1];

    const authenticated = await this.siweService.verifyMessage({
      message,
      signature,
      nonce,
    });

    //TODO:  implement session via cookie

    return response
      .status(authenticated ? HttpStatus.OK : HttpStatus.NOT_FOUND)
      .send(authenticated);
  }

  @Put() // TODO: see if it requires further attention (http method)
  async getNonce(@Res() response: Response) {
    const nonce = this.siweService.getNonce();
    return response.status(HttpStatus.OK).send(nonce);
  }

  @Delete()
  async signOut(): Promise<any> {
    console.log('SIWE logout');
    return this.siweService.signOut();
  }
}
