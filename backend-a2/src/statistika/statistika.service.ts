import { Injectable, Inject } from '@nestjs/common';
import { sql, gte } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class StatistikaService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  // Feature 1: broj kupljenih karata po utakmici
  async brojKarataPoUtakmici() {
    const rezultat = await this.db
      .select({
        idUtakmice: schema.utakmicaRef.idUtakmice,
        naziv: schema.utakmicaRef.naziv,
        datumOdigravanja: schema.utakmicaRef.datumOdigravanja,
        brojKarata: sql<number>`count(${schema.stavkaKupovine.id})`.as('brojKarata'),
      })
      .from(schema.utakmicaRef)
      .leftJoin(schema.stavkaKupovine, sql`${schema.stavkaKupovine.idUtakmice} = ${schema.utakmicaRef.idUtakmice}`)
      .groupBy(schema.utakmicaRef.idUtakmice, schema.utakmicaRef.naziv, schema.utakmicaRef.datumOdigravanja)
      .orderBy(schema.utakmicaRef.datumOdigravanja);

    return rezultat.map((r) => ({ ...r, brojKarata: Number(r.brojKarata) }));
  }

  // Feature 2: broj kupljenih karata po danima, od proizvoljnog datuma početka prodaje
  async brojKarataPoDanima(datumPocetkaProdaje?: string) {
    const uslov = datumPocetkaProdaje
      ? gte(schema.kupovinaKarte.datumKupovine, new Date(datumPocetkaProdaje))
      : undefined;

    const rezultat = await this.db
      .select({
        dan: sql<string>`date(${schema.kupovinaKarte.datumKupovine})`.as('dan'),
        brojKarata: sql<number>`count(*)`.as('brojKarata'),
      })
      .from(schema.kupovinaKarte)
      .where(uslov)
      .groupBy(sql`date(${schema.kupovinaKarte.datumKupovine})`)
      .orderBy(sql`date(${schema.kupovinaKarte.datumKupovine})`);

    return rezultat.map((r) => ({ ...r, brojKarata: Number(r.brojKarata) }));
  }
}