import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './setting.service';
import { SettingsController } from './setting.controller';
import { SeedSettingService } from '../../database/setting/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  exports: [TypeOrmModule, SettingsService],
  providers: [SettingsService, SeedSettingService],
  controllers: [SettingsController],
})
export class SettingsModule {}
