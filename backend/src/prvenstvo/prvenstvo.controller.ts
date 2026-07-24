import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PrvenstvoService } from './prventstvo.service';

@Controller('prvenstvo')
export class PrvenstvoController {
  constructor(private readonly prvenstvoService: PrvenstvoService) {}

  @Get()
  async getSve() {
    return this.prvenstvoService.getSve();
  }

  @Patch(':id')
  async azuriraj(@Param('id', ParseIntPipe) id: number, @Body() podaci: any) {
    return this.prvenstvoService.azuriraj(id, podaci);
  }
}