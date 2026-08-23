import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { KartaService } from './karta.service';
import type { KreirajKupovinuDto } from './dto/kreiraj-kupovinu.dto';

@Controller('karta')
export class KartaController {
  constructor(private readonly kartaService: KartaService) {}

  @Post()
  async kupiKartu(@Body() dto: KreirajKupovinuDto) {
    return this.kartaService.zapocniKupovinu(dto);
  }

  @Get('promo-kod/:kod')
  async proveriPromoKod(@Param('kod') kod: string) {
    return this.kartaService.proveriPromoKod(kod);
  }
  
  @Get(':idPoruke/status')
  async proveriStatus(@Param('idPoruke') idPoruke: string) {
    return this.kartaService.dohvatiStatus(idPoruke);
  }

  @Get('pronadji')
  async pronadji(@Query('sifra') sifra: string, @Query('email') email: string) {
    return this.kartaService.pronadjiKartu(sifra, email);
  }

  @Patch('izmeni')
  async izmeni(@Body() body: { sifra: string; email: string; utakmiceId: number[] }) {
    return this.kartaService.izmeniKartu(body.sifra, body.email, body.utakmiceId);
  }

  @Post('otkazi')
  async otkazi(@Body() body: { sifra: string; email: string }) {
    return this.kartaService.otkaziKartu(body.sifra, body.email);
  }
}