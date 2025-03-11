import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: ['https://krolpluskrosh.online', 'https://5.35.103.104'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
