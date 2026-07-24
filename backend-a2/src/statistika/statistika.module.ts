import { Module } from '@nestjs/common';
import { StatistikaController } from './statistika.controller';
import { StatistikaService } from './statistika.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [StatistikaController],
  providers: [StatistikaService],
})
export class StatistikaModule {}