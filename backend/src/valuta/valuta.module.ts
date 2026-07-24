import { Module } from '@nestjs/common';
import { ValutaController } from './valuta.controller';
import { ValutaService } from './valuta.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ValutaController],
  providers: [ValutaService],
})
export class ValutaModule {}