import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('Gateway Web-Portal Backend')
    .setDescription('Backend APIs')
    .setVersion('1.0')
    .addTag('specs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('specs', app, document);

  app.use(cookieParser());

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
