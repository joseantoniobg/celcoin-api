import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('boostrap');

  const app = await NestFactory.create(AppModule);
  const configs = config.get('server');

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    //app.enableCors();
  }

  const port = process.env.API_PORT || configs.port;
  await app.listen(port);
  logger.log(`App started listening port ${port}`);
}
bootstrap();
