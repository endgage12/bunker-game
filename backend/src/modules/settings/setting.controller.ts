import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SettingsService } from './setting.service';
import { Setting } from './entities/setting.entity';

@Controller('setting')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':title')
  async findAll(@Param() params: Setting): Promise<Setting[]> {
    return await this.settingsService.findByTitle(params.title);
  }

  @Post('/:title/create')
  async create(@Body() settingData: Setting): Promise<string> {
    const createdSetting = await this.settingsService.create(settingData);
    return `setting created: ${JSON.stringify(createdSetting)}`;
  }

  @Post('/:title/update')
  async update(@Body() settingData: Setting): Promise<string> {
    const updatedSetting = await this.settingsService.update(
      settingData.id,
      settingData,
    );
    return `setting updated: ${JSON.stringify(updatedSetting)}`;
  }

  @Post('/:title/remove')
  async remove(@Body() settingData: Setting): Promise<string> {
    const createdSetting = await this.settingsService.remove(settingData.id);
    return `setting removed: ${JSON.stringify(createdSetting)}`;
  }
}
