import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UtakmicaService } from './utakmica.service';

@Controller('utakmica')
export class UtakmicaController {
  constructor(private readonly utakmicaService: UtakmicaService) {}

  @Get()
  async getSve() {
    return this.utakmicaService.getSve();
  }

  @Post()
  async dodaj(@Body() podaci: any) {
    return this.utakmicaService.dodaj(podaci);
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.utakmicaService.azuriraj(id, podaci);
  }

  @Delete(':id')
  async obrisi(@Param('id', ParseIntPipe) id: number) {
    return this.utakmicaService.obrisi(id);
  }
}