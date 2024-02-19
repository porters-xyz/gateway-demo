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
  async getSession(@Req() request: Request): Promise<any> {
    console.log('Get Session from cookie using siwe');
    const sessionCookie = request.cookies.get('session')?.value ?? null;
    return this.siweService.getSession(sessionCookie);
  }

  @Post()
  async verifyMessage(
    @Body() { message, signature }: { message: string; signature: string },
    @Res() response: Response,
  ) {
    console.log('Verify ownership using siwe');
    try {
      const cookie = await this.siweService.verifyMessage({
        message,
        signature,
      });
      response.status(HttpStatus.OK).send(cookie);
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).send(false);
    }
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
