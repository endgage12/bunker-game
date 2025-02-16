import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../../modules/settings/entities/setting.entity';
import { Repository } from 'typeorm';
import { settingsMock } from '../mock/settingsMock';

@Injectable()
export class SeedSettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async seed() {
    await this.settingRepository.clear();
    await this.settingRepository.save(settingsMock);
    console.log('seeder settings is successfully completed');
  }
}
