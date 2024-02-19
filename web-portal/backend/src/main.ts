import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // TODO: Remove CORS in prod

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'DEVELOPMENT'
        ? 'http://localhost:3000'
        : 'http://frontend:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();
