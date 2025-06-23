import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const host = process.env.HOST ?? '0.0.0.0';
  const port = process.env.PORT ?? 3010;
  const publicUrl = process.env.PUBLIC_URL ?? `http://${host}:${port}`;

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Origin',
    ],
    exposedHeaders: ['Location', 'X-Redirect-Location'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 3600,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API for shortening URLs')
    .setVersion('1.0')
    .addServer(`http://${host}:${port}`, 'Current server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, host);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log(`Application is running on: ${publicUrl}`);
  console.log(`Swagger UI is available on: ${publicUrl}/api`);
  console.log(`CORS is enabled for all origins`);
}

bootstrap();
