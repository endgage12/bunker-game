import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  exports: [TypeOrmModule, RoomService],
  providers: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
