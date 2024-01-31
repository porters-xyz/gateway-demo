import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    console.log('Called RootPath');
    return 'Hello from the backend!';
  }
}
