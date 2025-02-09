import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Profession } from './entities/profession.entity';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private readonly professionsRepository: Repository<Profession>,
  ) {}

  findAll(): Promise<Profession[]> {
    return this.professionsRepository.find();
  }

  findOne(id: number): Promise<Profession | null> {
    return this.professionsRepository.findOneBy({ id });
  }

  async create(professionData: Partial<Profession>): Promise<Profession> {
    const newProfession = this.professionsRepository.create(professionData);
    return await this.professionsRepository.save(newProfession);
  }

  async update(id: number, data: Partial<Profession>): Promise<UpdateResult> {
    return await this.professionsRepository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.professionsRepository.delete(id);
  }
}
