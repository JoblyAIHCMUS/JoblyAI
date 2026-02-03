import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import initPassport from './app/strategy/oidc.strategy'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import session from 'express-session';

import passport from 'passport';

async function bootstrap() {
  initPassport();
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.use(
    session({
      secret: 'super-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // 1 hour
    }),
  );
  app.use(passport.authenticate('session'));
  const globalPrefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('JoblyAI API')
    .setDescription('The JoblyAI backend API description')
    .setVersion('1.0')
    .addBearerAuth() // Optional: Useful if you add JWT auth later
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation is running on: http://localhost:${port}/api/docs`
  );
}

bootstrap();
