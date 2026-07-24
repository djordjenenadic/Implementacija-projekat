import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { DogadjajiConsumer } from './dogadjaj/dogadjaj.consumer';
import { StatistikaModule } from './statistika/statistika.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule, StatistikaModule],
  providers: [DogadjajiConsumer],
})
export class AppModule {}