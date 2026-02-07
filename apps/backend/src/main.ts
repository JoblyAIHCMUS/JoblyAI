import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/common/filter/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.set('trust proxy', 1);
  
  app.enableCors({
    origin: [
      process.env.WEB_URL || 'http://localhost:5173',
      process.env.APP_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });
  
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const globalPrefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('JoblyAI API')
    .setDescription('The JoblyAI backend API description')
    .setVersion('1.0')
    .addBearerAuth()
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
