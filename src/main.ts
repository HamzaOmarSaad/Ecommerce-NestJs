import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defaultLang } from './common/middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(defaultLang);
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log('🚀 server is running on port  ', process.env.PORT);
  });
}
bootstrap();
