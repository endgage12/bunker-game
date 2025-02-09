import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  findAll(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  findById(roomId: string): Promise<Room | null> {
    return this.roomRepository.findOneBy({ roomId });
  }

  async create(roomData: Partial<Room>): Promise<Room> {
    const newRoom = this.roomRepository.create(roomData);
    return await this.roomRepository.save(newRoom);
  }

  async update(id: number, data: Partial<Room>): Promise<UpdateResult> {
    return await this.roomRepository.update(id, data);
  }

  async updatePlayers(roomId: string, players: string): Promise<UpdateResult> {
    return await this.roomRepository.update({ roomId }, { players });
  }
}
