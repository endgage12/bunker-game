import { AppService, Card } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    cardGenerate(params: object): Promise<Card>;
}
