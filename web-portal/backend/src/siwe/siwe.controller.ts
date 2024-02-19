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
import { generateNonce } from 'siwe';

@Controller('siwe')
export class SiweController {
  constructor(private readonly siweService: SiweService) {}

  @Get()
  async getSession(@Req() request: Request): Promise<any> {
    console.log('Get Session from cookie using siwe');
    const sessionCookie = request.cookies.get('session') ?? null;
    return this.siweService.getSessionFromCookie(sessionCookie);
  }

  @Post()
  async verifyMessage(
    @Body() { message, signature }: { message: string; signature: string },
    @Res() response: Response,
  ) {
    console.log('Verify ownership using siwe');
    try {
      await this.siweService.verifyMessage({ message, signature });
      response.status(HttpStatus.OK).send(true);
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).send(false);
    }
  }

  @Put('/nonce')
  async getNonce(@Req() request: Request, @Res() res: Response) {
    const sessionCookie = request.cookies.get('session') ?? null;
    return this.siweService.getNonce(sessionCookie);
  }

  @Delete()
  async signOut(): Promise<any> {
    console.log('SIWE logout');
    return this.siweService.signOut();
  }
}
