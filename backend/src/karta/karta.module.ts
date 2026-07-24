import { Module } from '@nestjs/common';
import { KartaController } from './karta.controller';
import { KartaService } from './karta.service';
import { DbModule } from '../db/db.module';
import { KartaConsumer } from './karta.consumer';
@Module({
  imports: [DbModule],
  controllers: [KartaController],
  providers: [KartaService,KartaConsumer],
})
export class KartaModule {}