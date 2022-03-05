import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fmp from 'fastify-multipart';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  /**
   * Execute constructor of FastifyAdapter with FastifyInstance as an argument,
   * and create an instance of FastifyAdapter with logger-related settings.
   */
  const adapter = new FastifyAdapter();
  // Create an instance of NestApplication with the specified httpAdapter.
  const app =
    await NestFactory.create<NestFastifyApplication>(
      AppModule, // Entry (root) application module class.
      adapter, // Adapter to proxy the request/response cycle to the underlying HTTP server.
    );
  // Register a prefix for every HTTP route path.
  app.setGlobalPrefix('api');

  // Define swagger document
  const config = new DocumentBuilder()
    .setTitle('Nest File API')
    .setDescription(
      'Documentation for Nest File API',
    )
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey', // 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
        name: 'Authorization',
        in: 'header',
      },
      'access-key_for_rest-api', // api key name
    )
    .build();
  const document = SwaggerModule.createDocument(
    app,
    config,
  );
  /**
   * @see http://localhost:3000/docs/static/index.html
   */
  SwaggerModule.setup('docs', app, document);

  // register fmp(fastify-multipart)
  await app.register(fmp);
  await app.listen(parseInt(process.env.PORT) || 3000, '0.0.0.0');
}
bootstrap();
