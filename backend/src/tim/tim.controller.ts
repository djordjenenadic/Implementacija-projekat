import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TimService } from './tim.services';

@Controller('tim')
export class TimController {
  constructor(private readonly timService: TimService) {}

  @Get()
  async getSve() {
    return this.timService.getSve();
  }

  @Post()
  async dodaj(@Body() podaci: any) {
    return this.timService.dodaj(podaci);
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.timService.azuriraj(id, podaci);
  }

  @Delete(':id')
  async obrisi(@Param('id', ParseIntPipe) id: number) {
    return this.timService.obrisi(id);
  }
}