import { Injectable, Inject,BadRequestException } from '@nestjs/common';
import { and, or,eq, ne} from 'drizzle-orm';
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
  if (podaci.tim1Id === podaci.tim2Id) {
    throw new BadRequestException('Tim ne može igrati sam protiv sebe.');
  }

  const [sukobStadiona] = await this.db.select().from(schema.utakmica)
    .where(and(
      eq(schema.utakmica.idStadiona, podaci.idStadiona),
      eq(schema.utakmica.datum, podaci.datum),
      eq(schema.utakmica.vreme, podaci.vreme),
    ));

  if (sukobStadiona) {
    throw new BadRequestException('Stadion je već zauzet u tom terminu.');
  }

  // Provera 3 -- IZMENJENO: sada proverava CEO DAN, ne samo isti termin
  const [sukobTima] = await this.db.select().from(schema.utakmica)
    .where(and(
      eq(schema.utakmica.datum, podaci.datum),
      or(
        eq(schema.utakmica.tim1Id, podaci.tim1Id),
        eq(schema.utakmica.tim2Id, podaci.tim1Id),
        eq(schema.utakmica.tim1Id, podaci.tim2Id),
        eq(schema.utakmica.tim2Id, podaci.tim2Id),
      ),
    ));

  if (sukobTima) {
    throw new BadRequestException('Jedan od timova već ima utakmicu zakazanu tog dana.');
  }

  const [nova] = await this.db.insert(schema.utakmica).values(podaci).returning();
  return nova;
}

  async azuriraj(id: number, podaci: Partial<typeof schema.utakmica.$inferInsert>) {
  const [postojeca] = await this.db.select().from(schema.utakmica).where(eq(schema.utakmica.idUtakmica, id));

  const noviTim1 = podaci.tim1Id ?? postojeca.tim1Id;
  const noviTim2 = podaci.tim2Id ?? postojeca.tim2Id;
  const noviDatum = podaci.datum ?? postojeca.datum;
  const noviStadion = podaci.idStadiona ?? postojeca.idStadiona;
  const novoVreme = podaci.vreme ?? postojeca.vreme;

  if (noviTim1 === noviTim2) {
    throw new BadRequestException('Tim ne može igrati sam protiv sebe.');
  }

  const [sukobStadiona] = await this.db.select().from(schema.utakmica)
    .where(and(
      eq(schema.utakmica.idStadiona, noviStadion),
      eq(schema.utakmica.datum, noviDatum),
      eq(schema.utakmica.vreme, novoVreme),
      ne(schema.utakmica.idUtakmica, id),
    ));

  if (sukobStadiona) {
    throw new BadRequestException('Stadion je već zauzet u tom terminu.');
  }

  const [sukobTima] = await this.db.select().from(schema.utakmica)
    .where(and(
      eq(schema.utakmica.datum, noviDatum),
      ne(schema.utakmica.idUtakmica, id),
      or(
        eq(schema.utakmica.tim1Id, noviTim1),
        eq(schema.utakmica.tim2Id, noviTim1),
        eq(schema.utakmica.tim1Id, noviTim2),
        eq(schema.utakmica.tim2Id, noviTim2),
      ),
    ));

  if (sukobTima) {
    throw new BadRequestException('Jedan od timova već ima utakmicu zakazanu tog dana.');
  }

  const [azurirana] = await this.db.update(schema.utakmica).set(podaci)
    .where(eq(schema.utakmica.idUtakmica, id)).returning();
  return azurirana;
}

  async obrisi(id: number) {
    await this.db.delete(schema.utakmica).where(eq(schema.utakmica.idUtakmica, id));
    return { obrisano: true };
  }
}