import { Body, Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { SiweService } from './siwe.service';
import { Request } from 'express';

@Controller('siwe')
export class SiweController {
  constructor(private readonly siweService: SiweService) {}

  @Get()
  async getSession(@Req() request: Request): Promise<any> {
    console.log('Get Session using siwe');
    const sessionCookie = request.cookies.get('web3session') ?? null;
    return this.siweService.getSession(sessionCookie);
  }

  @Post()
  async verifyMessage(
    @Body() { message, signature }: { message: string; signature: string },
  ): Promise<any> {
    console.log('Verify ownership using siwe');
    return this.siweService.verifyMessage({ message, signature });
  }

  @Put()
  async getNonce(@Req() request: Request): Promise<any> {
    console.log('Get Nonce');
    const sessionCookie = request.cookies.get('web3session') ?? null;
    return this.siweService.getNonce(sessionCookie);
  }

  @Delete()
  async signOut(): Promise<any> {
    console.log('SIWE logout');
    return this.siweService.signOut();
  }
}
