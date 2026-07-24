import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class GrupaService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSve() {
    const grupe = await this.db.select().from(schema.grupa);

    const rezultat = await Promise.all(
      grupe.map(async (g) => {
        const timovi = await this.db
          .select()
          .from(schema.tim)
          .where(eq(schema.tim.idGrupe, g.idGrupa));
        return { ...g, timovi };
      }),
    );

    return rezultat;
  }

  async dodaj(podaci: typeof schema.grupa.$inferInsert) {
    const [nova] = await this.db.insert(schema.grupa).values(podaci).returning();
    return nova;
  }

  async azuriraj(id: number, podaci: Partial<typeof schema.grupa.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.grupa)
      .set(podaci)
      .where(eq(schema.grupa.idGrupa, id))
      .returning();
    return azurirano;
  }

  async obrisi(id: number) {
    await this.db.delete(schema.grupa).where(eq(schema.grupa.idGrupa, id));
    return { obrisano: true };
  }
}