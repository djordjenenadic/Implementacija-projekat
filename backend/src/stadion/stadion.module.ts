import { Module } from '@nestjs/common';
import { StadionController } from './stadion.controller';
import { StadionService } from './stadion.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [StadionController],
  providers: [StadionService],
})
export class StadionModule {}