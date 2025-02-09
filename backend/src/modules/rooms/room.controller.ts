import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';

@Controller('room')
export class RoomController {
  constructor(private readonly RoomService: RoomService) {}

  @Get('/getList')
  async getList(): Promise<Room[]> {
    return await this.RoomService.findAll();
  }

  @Get('/:roomId')
  async findAll(@Param() params: Room): Promise<Room | null> {
    return await this.RoomService.findById(params.roomId);
  }

  @Post('/create')
  async create(@Body() roomData: Room): Promise<string> {
    const createdRoom = await this.RoomService.create({
      ...roomData,
      dateCreated: new Date(),
    });
    return `room created: ${JSON.stringify(createdRoom)}`;
  }

  @Post(':id/update')
  async update(@Body() roomData: Room): Promise<string> {
    const updatedRoom = await this.RoomService.update(roomData.id, roomData);
    return `room updated: ${JSON.stringify(updatedRoom)}`;
  }
}
