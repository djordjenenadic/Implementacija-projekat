import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TimService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSve() {
    return this.db.select().from(schema.tim);
  }

  async dodaj(podaci: typeof schema.tim.$inferInsert) {
    const [novi] = await this.db.insert(schema.tim).values(podaci).returning();
    return novi;
  }

  async azuriraj(id: number, podaci: Partial<typeof schema.tim.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.tim)
      .set(podaci)
      .where(eq(schema.tim.idTim, id))
      .returning();
    return azurirano;
  }

  async obrisi(id: number) {
    await this.db.delete(schema.tim).where(eq(schema.tim.idTim, id));
    return { obrisano: true };
  }
}