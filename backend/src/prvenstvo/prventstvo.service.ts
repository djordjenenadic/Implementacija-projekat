import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import { REDIS } from '../db/redis.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';

const KLJUC_KESA = 'prvenstvo:sve';
const TRAJANJE_KESA_SEKUNDE = 3600;

@Injectable()
export class PrvenstvoService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async getSve() {
    const izKesa = await this.redis.get(KLJUC_KESA);
    if (izKesa) return JSON.parse(izKesa);

    const izBaze = await this.db.select().from(schema.prvenstvo);
    await this.redis.set(KLJUC_KESA, JSON.stringify(izBaze), 'EX', TRAJANJE_KESA_SEKUNDE);
    return izBaze;
  }

  async azuriraj(id: number, podaci: Partial<typeof schema.prvenstvo.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.prvenstvo)
      .set(podaci)
      .where(eq(schema.prvenstvo.idPrvenstva, id))
      .returning();

    // KLJUČNO: obriši keš, da sledeći GET zahtev povuče sveže podatke
    await this.redis.del(KLJUC_KESA);

    return azurirano;
  }
}