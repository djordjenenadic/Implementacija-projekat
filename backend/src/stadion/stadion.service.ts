import { Injectable, Inject ,BadRequestException} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class StadionService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSve() {
    return this.db.select().from(schema.stadion);
  }

  async dodaj(podaci: typeof schema.stadion.$inferInsert) {
  if (podaci.kapacitet <= 0) {
    throw new BadRequestException('Kapacitet stadiona mora biti veći od nule.');
  }

  const [postojeci] = await this.db.select().from(schema.stadion)
    .where(eq(schema.stadion.naziv, podaci.naziv));

  if (postojeci) {
    throw new BadRequestException('Stadion sa tim nazivom već postoji.');
  }

  const [novi] = await this.db.insert(schema.stadion).values(podaci).returning();
  return novi;
}

  async azuriraj(id: number, podaci: Partial<typeof schema.stadion.$inferInsert>) {
    const [azurirano] = await this.db
      .update(schema.stadion)
      .set(podaci)
      .where(eq(schema.stadion.idStadion, id))
      .returning();
    return azurirano;
  }

  async obrisi(id: number) {
    await this.db.delete(schema.stadion).where(eq(schema.stadion.idStadion, id));
    return { obrisano: true };
  }
}