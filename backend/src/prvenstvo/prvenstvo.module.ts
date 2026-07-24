import { Module } from '@nestjs/common';
import { PrvenstvoController } from './prvenstvo.controller';
import { PrvenstvoService } from './prventstvo.service';
import { DbModule } from '../db/db.module';
@Module({
imports: [DbModule],
  controllers: [PrvenstvoController],
  providers: [PrvenstvoService],
})
export class PrvenstvoModule {}