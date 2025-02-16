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
export declare class AppService {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
}
