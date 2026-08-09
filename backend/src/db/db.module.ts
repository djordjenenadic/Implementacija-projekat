import { Global, Module } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';
import { redisProvider } from './redis.provider';
@Global()
@Module({
  providers: [drizzleProvider, redisProvider],
  exports: [drizzleProvider, redisProvider],
})
export class DbModule {}