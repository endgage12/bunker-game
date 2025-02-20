import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersController } from './modules/users/user.controller';
import { ProfessionsController } from './modules/profession/profession.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { Profession } from './modules/profession/entities/profession.entity';
import { ProfessionsService } from './modules/profession/profession.service';
import { ProfessionsModule } from './modules/profession/profession.module';
import { SettingsModule } from './modules/settings/setting.module';
import { Setting } from './modules/settings/entities/setting.entity';
import { Room } from './modules/rooms/entities/room.entity';
import { RoomModule } from './modules/rooms/room.module';
import { GameModule } from './modules/game/game.module';
import { ConfigModule } from '@nestjs/config';
import { ChatgptService } from './modules/chatgpt/chatgpt.service';
import { ChatgptModule } from './modules/chatgpt/chatgpt.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'your_user',
      password: 'your_password',
      database: 'your_db',
      entities: [User, Profession, Setting, Room],
      synchronize: true,
    }),
    ProfessionsModule,
    SettingsModule,
    RoomModule,
    GameModule,
    ChatgptModule,
    ConfigModule.forRoot(),
  ],
  exports: [TypeOrmModule],
  controllers: [AppController, UsersController, ProfessionsController],
  providers: [AppService, ProfessionsService, ChatgptService],
})
export class AppModule {}
