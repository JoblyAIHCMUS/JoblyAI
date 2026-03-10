import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './app/common/filter/http-exceptions.filter';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

function loadOpenApiFromYaml(): OpenAPIObject | null {
  const candidatePaths = [
    join(__dirname, 'assets', 'openapi.yaml'),
    join(process.cwd(), 'apps', 'backend', 'src', 'assets', 'openapi.yaml'),
  ];

  const openApiPath = candidatePaths.find((candidate) => existsSync(candidate));
  if (!openApiPath) {
    return null;
  }

  const openApiContent = readFileSync(openApiPath, 'utf8');
  return parse(openApiContent) as OpenAPIObject;
}

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
  app.use(cookieParser());
  const globalPrefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('JoblyAI API')
    .setDescription('The JoblyAI backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  let document: OpenAPIObject;
  try {
    const yamlDocument = loadOpenApiFromYaml();
    document = yamlDocument ?? SwaggerModule.createDocument(app, config);
    if (yamlDocument) {
      Logger.log('📄 Swagger is loaded from assets/openapi.yaml');
    }
  } catch (error) {
    Logger.warn(
      `Could not parse assets/openapi.yaml. Falling back to generated Swagger. ${String(
        error
      )}`
    );
    document = SwaggerModule.createDocument(app, config);
  }

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
