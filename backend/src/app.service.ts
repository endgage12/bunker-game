import { Injectable } from '@nestjs/common';
import { SettingsService } from './modules/settings/setting.service';

export interface Card {
  profession: string;
  hobby: string;
  gender: string;
  health: string;
  fear: string;
  bag: string;
  inventory: string;
  'super-possibility': string;
}

@Injectable()
export class AppService {
  constructor(private readonly settingsService: SettingsService) {}
}
