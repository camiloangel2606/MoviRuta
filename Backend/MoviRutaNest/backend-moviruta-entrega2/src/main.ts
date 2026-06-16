import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Habilitar CORS para permitir que Angular (puerto 4200) se comunique con NestJS
  // Necesario para que el webhook de ePayco (x-www-form-urlencoded) llegue parseado
  app.use(express.urlencoded({ extended: true }));

  app.enableCors({
    origin: 'http://localhost:4200', // Reemplaza con tu URL de Angular si es diferente
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // limpia campos no definidos
      forbidNonWhitelisted: true, // error si mandan basura
      transform: true,            // transforma types de DTOs
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();