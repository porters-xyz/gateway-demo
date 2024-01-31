import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AppService {
  // constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
