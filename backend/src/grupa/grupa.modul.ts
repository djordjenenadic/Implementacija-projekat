import { Module } from '@nestjs/common';
import { GrupaController } from './grupa.controller';
import { GrupaService } from './grupa.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [GrupaController],
  providers: [GrupaService],
})
export class GrupaModule {}