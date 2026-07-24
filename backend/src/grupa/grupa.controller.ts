import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { GrupaService } from './grupa.service';

@Controller('grupa')
export class GrupaController {
  constructor(private readonly grupaService: GrupaService) {}

  @Get()
  async getSve() {
    return this.grupaService.getSve();
  }

  @Post()
  async dodaj(@Body() podaci: any) {
    return this.grupaService.dodaj(podaci);
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.grupaService.azuriraj(id, podaci);
  }

  @Delete(':id')
  async obrisi(@Param('id', ParseIntPipe) id: number) {
    return this.grupaService.obrisi(id);
  }
}