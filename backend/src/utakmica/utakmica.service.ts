import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UtakmicaService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSve() {
    return this.db.select().from(schema.utakmica);
  }

  async dodaj(podaci: typeof schema.utakmica.$inferInsert) {
    const [nova] = await this.db.insert(schema.utakmica).values(podaci).returning();
    return nova;
  }

  async azuriraj(id: number, podaci: Partial<typeof schema.utakmica.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.utakmica)
      .set(podaci)
      .where(eq(schema.utakmica.idUtakmica, id))
      .returning();
    return azurirano;
  }

  async obrisi(id: number) {
    await this.db.delete(schema.utakmica).where(eq(schema.utakmica.idUtakmica, id));
    return { obrisano: true };
  }
}