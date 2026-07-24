import { Controller, Get, Query } from '@nestjs/common';
import { StatistikaService } from './statistika.service';

@Controller('statistika')
export class StatistikaController {
  constructor(private readonly statistikaService: StatistikaService) {}

  @Get('po-utakmici')
  async poUtakmici() {
    return this.statistikaService.brojKarataPoUtakmici();
  }

  @Get('po-danima')
  async poDanima(@Query('od') datumPocetkaProdaje?: string) {
    return this.statistikaService.brojKarataPoDanima(datumPocetkaProdaje);
  }
}