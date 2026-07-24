import { Module } from '@nestjs/common';
import { UtakmicaController } from './utakmica.controller';
import { UtakmicaService } from './utakmica.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [UtakmicaController],
  providers: [UtakmicaService],
})
export class UtakmicaModule {}