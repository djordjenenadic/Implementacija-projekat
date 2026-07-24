import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrupaModule } from './grupa/grupa.modul';
import { PrvenstvoModule } from './prvenstvo/prvenstvo.module';
import { StadionModule } from './stadion/stadion.module';
import { TimModule } from './tim/tim.module';
import { UtakmicaModule } from './utakmica/utakmica.module';
import { KartaModule } from './karta/karta.module';
import { ValutaModule } from './valuta/valuta.module';
@Module({
imports: [ConfigModule.forRoot({ isGlobal: true }), PrvenstvoModule, GrupaModule, StadionModule, ValutaModule, TimModule, UtakmicaModule,KartaModule],
controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}