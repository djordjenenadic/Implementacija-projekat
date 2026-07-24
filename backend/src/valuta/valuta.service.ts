import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ValutaService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSve() {
    return this.db.select().from(schema.valuta);
  }

  async dodaj(podaci: typeof schema.valuta.$inferInsert) {
    const [nova] = await this.db.insert(schema.valuta).values(podaci).returning();
    return nova;
  }

  async azuriraj(id: number, podaci: Partial<typeof schema.valuta.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.valuta)
      .set(podaci)
      .where(eq(schema.valuta.idValute, id))
      .returning();
    return azurirano;
  }

  async obrisi(id: number) {
    await this.db.delete(schema.valuta).where(eq(schema.valuta.idValute, id));
    return { obrisano: true };
  }
}