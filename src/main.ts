import { NestFactory } from '@nestjs/core';
import { UsersModule } from './modules/users.module';
import { json, urlencoded } from 'express';
import { hostname } from 'os';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  app.enableCors({
    origin: 'https://diary-mate.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://diary-mate.vercel.app');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200); 
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
