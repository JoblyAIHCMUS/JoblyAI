import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import passport from 'passport';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/common/filter/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) =>
    Logger.error(`Redis client error: ${err?.message || err}`)
  );
  await redisClient.connect();
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.set('trust proxy', 1);
  app.use(
    session({
      store: new RedisStore({ client: redisClient, prefix: 'session:' }),
      secret: 'super-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
      },
    })
  );
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalFilters(new AllExceptionsFilter());
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
