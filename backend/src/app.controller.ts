import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService, Card } from './app.service';
import { Setting } from './modules/settings/entities/setting.entity';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sayHello(): string {
    return 'hi';
  }

  @Post('/card/generate')
  async cardGenerate(@Body() params: object): Promise<Card> {
    // @ts-ignore
    return await this.appService.cardGenerate(params.amount);
  }
}
