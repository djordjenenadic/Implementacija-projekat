import { Module } from '@nestjs/common';
import { TimController } from './tim.controller';
import { TimService } from './tim.services';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [TimController],
  providers: [TimService],
})
export class TimModule {}