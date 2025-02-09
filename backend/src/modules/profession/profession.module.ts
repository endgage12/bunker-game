import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionsService } from './profession.service';
import { ProfessionsController } from './profession.controller';
import { Profession } from './entities/profession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  exports: [TypeOrmModule],
  providers: [ProfessionsService],
  controllers: [ProfessionsController],
})
export class ProfessionsModule {}
