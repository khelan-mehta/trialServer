import { NestFactory } from '@nestjs/core';
import { UsersModule } from './modules/users.module';
import { json, urlencoded } from 'express';
import { hostname } from 'os';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
