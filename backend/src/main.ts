import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.enableCors({ origin: ['http://localhost:8181', 'http://5.35.103.104', 'https://5.35.103.104', 'https://krolpluskrosh.online'] });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
