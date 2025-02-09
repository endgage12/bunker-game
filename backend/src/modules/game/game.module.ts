import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AppService } from '../../app.service';
import { SettingsService } from '../settings/setting.service';
import { SettingsModule } from '../settings/setting.module';
import { RoomModule } from '../rooms/room.module';

@Module({
  imports: [SettingsModule, RoomModule],
  providers: [GameGateway, AppService, SettingsService],
})
export class GameModule {}
