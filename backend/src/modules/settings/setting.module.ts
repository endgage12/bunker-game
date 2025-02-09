import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './setting.service';
import { SettingsController } from './setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  exports: [TypeOrmModule, SettingsService],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
