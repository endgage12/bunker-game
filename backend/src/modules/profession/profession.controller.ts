import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProfessionsService } from './profession.service';
import { Profession } from './entities/profession.entity';

@Controller('profession')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get()
  async findAll(): Promise<Profession[]> {
    return await this.professionsService.findAll();
  }

  @Post('/create')
  async create(@Body() professionData: Profession): Promise<string> {
    const createdProfession =
      await this.professionsService.create(professionData);
    return `Profession created: ${JSON.stringify(createdProfession)}`;
  }

  @Post('/update')
  async update(@Body() professionData: Profession): Promise<string> {
    const updatedProfession = await this.professionsService.update(
      professionData.id,
      professionData,
    );
    return `Profession updated: ${JSON.stringify(updatedProfession)}`;
  }

  @Post('/remove')
  async remove(@Body() professionData: Profession): Promise<string> {
    const createdProfession = await this.professionsService.remove(
      professionData.id,
    );
    return `Profession removed: ${JSON.stringify(createdProfession)}`;
  }
}
