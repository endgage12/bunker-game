import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  findAll(): Promise<Setting[]> {
    return this.settingRepository.find();
  }

  findTitlesDistinct(): Promise<string[]> {
    const query = this.settingRepository
      .createQueryBuilder('setting')
      .select('title')
      .distinct();
    return query.getRawMany();
  }

  findOne(id: number): Promise<Setting | null> {
    return this.settingRepository.findOneBy({ id });
  }

  async findByTitle(title: string): Promise<Setting[]> {
    return await this.settingRepository.find({
      where: { title },
    });
  }

  async create(settingData: Partial<Setting>): Promise<Setting> {
    const newSetting = this.settingRepository.create(settingData);
    return await this.settingRepository.save(newSetting);
  }

  async update(id: number, data: Partial<Setting>): Promise<UpdateResult> {
    return await this.settingRepository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.settingRepository.delete(id);
  }

  async getRandom(title: string): Promise<string> {
    const settings = await this.settingRepository.find({
      where: {
        title,
      },
    });

    if (!settings.length) return 'Не определено';
    return settings[Math.floor(Math.random() * settings.length)].value;
  }
}
