import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ValutaService } from './valuta.service';

@Controller('valuta')
export class ValutaController {
  constructor(private readonly valutaService: ValutaService) {}

  @Get()
  async getSve() {
    return this.valutaService.getSve();
  }

  @Post()
  async dodaj(@Body() podaci: any) {
    return this.valutaService.dodaj(podaci);
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.valutaService.azuriraj(id, podaci);
  }

  @Delete(':id')
  async obrisi(@Param('id', ParseIntPipe) id: number) {
    return this.valutaService.obrisi(id);
  }
}