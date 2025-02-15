import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:8181', 'http://5.35.103.104'] });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
