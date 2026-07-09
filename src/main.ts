import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LanguageInterceptor } from './common/interceptor/language.interceptor';
import { TransformInterceptor } from './common/interceptor/response.interceptor';
import { resolve } from 'path/win32';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use('/uploads', express.static(resolve('./uploads')));
  // app.use(defaultLang);
  app.useGlobalInterceptors(
    new LanguageInterceptor(),
    new TransformInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log('🚀 server is running on port  ', process.env.PORT);
  });
}
bootstrap().catch((error) => {
  console.error(error);
});
