import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { StadionService } from './stadion.service';

@Controller('stadion')
export class StadionController {
  constructor(private readonly stadionService: StadionService) {}

  @Get()
  async getSve() {
    return this.stadionService.getSve();
  }

  @Post()
  async dodaj(@Body() podaci: any) {
    return this.stadionService.dodaj(podaci);
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.stadionService.azuriraj(id, podaci);
  }

  @Delete(':id')
  async obrisi(@Param('id', ParseIntPipe) id: number) {
    return this.stadionService.obrisi(id);
  }
}