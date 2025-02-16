import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedSettingService } from './setting/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedSettingService);
  await seedService.seed();
  await app.close();
}

bootstrap();
