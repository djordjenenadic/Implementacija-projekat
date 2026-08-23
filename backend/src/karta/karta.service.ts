import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, eq, inArray,ne,sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import { REDIS } from '../db/redis.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { KreirajKupovinuDto } from './dto/kreiraj-kupovinu.dto';
import { STREAM_DOGADJAJI_KARATA } from './karta.consumer';

export const STREAM_KUPOVINE = 'stream:kupovine-karata';

function kljucStatusa(idPoruke: string) {
  return `status:kupovina:${idPoruke}`;
}

@Injectable()
export class KartaService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async zapocniKupovinu(dto: KreirajKupovinuDto) {
    const poruka = {
      ...dto,
      utakmiceId: JSON.stringify(dto.utakmiceId),
      primljenoU: new Date().toISOString(),
    };
    const idPoruke = await this.redis.xadd(STREAM_KUPOVINE, '*', ...Object.entries(poruka).flat());
    await this.redis.set(kljucStatusa(idPoruke!), JSON.stringify({ status: 'obrada' }), 'EX', 3600);
    return { status: 'primljeno_na_obradu', idPoruke };
  }

  async dohvatiStatus(idPoruke: string) {
    const podaci = await this.redis.get(kljucStatusa(idPoruke));
    if (!podaci) return { status: 'nepoznato' };
    return JSON.parse(podaci);
  }

  async proveriPromoKod(kod: string) {
  const [promoKod] = await this.db.select().from(schema.promoKod)
    .where(eq(schema.promoKod.kod, kod));

  if (!promoKod) {
    throw new NotFoundException('Promo kod ne postoji.');
  }
  if (promoKod.iskoriscen) {
    throw new BadRequestException('Promo kod je već iskorišćen.');
  }

  return { vazi: true };
}
  // --- FEATURE 4 i 5: zajednička pomoćna funkcija ---
  private async pronadjiKartuIliBaci(sifra: string, email: string) {
    const [karta] = await this.db
      .select()
      .from(schema.karta)
      .where(and(eq(schema.karta.sifra, sifra), eq(schema.karta.email, email)));

    if (!karta) {
      throw new NotFoundException('Karta nije pronađena. Proveri šifru i email adresu.');
    }
    return karta;
  }

  async pronadjiKartu(sifra: string, email: string) {
    const karta = await this.pronadjiKartuIliBaci(sifra, email);
    const stavke = await this.db
      .select()
      .from(schema.stavkaKarte)
      .where(eq(schema.stavkaKarte.idKarte, karta.idKarta));
    return { ...karta, stavke };
  }

  // --- FEATURE 4: izmena karte ---
  async izmeniKartu(sifra: string, email: string, noveUtakmiceId: number[]) {
    const karta = await this.pronadjiKartuIliBaci(sifra, email);//pronalazimo kartu na osovu sifre i email-a

    if (karta.status === 'otkazana') {//ako je status pronadjene karte otkazana ona se ne moze menjati
      throw new BadRequestException('Otkazana karta se ne može menjati.');
    }
    if (noveUtakmiceId.length === 0) {
      throw new BadRequestException('Karta mora pokrivati bar jednu utakmicu.');
    }

    const noveUtakmice = await this.db
      .select()
      .from(schema.utakmica)
      .where(inArray(schema.utakmica.idUtakmica, noveUtakmiceId));

    if (noveUtakmice.length !== noveUtakmiceId.length) {
      throw new BadRequestException('Jedna ili više izabranih utakmica ne postoje.');
    }
    const postojeceStavke = await this.db
      .select()
      .from(schema.stavkaKarte)
      .where(eq(schema.stavkaKarte.idKarte, karta.idKarta));
    const postojeciIds = postojeceStavke.map((s) => s.idUtakmice);
    const dodateUtakmiceId = noveUtakmiceId.filter((id) => !postojeciIds.includes(id));

    for (const idUtak of dodateUtakmiceId) {
      const utakmica = noveUtakmice.find((u) => u.idUtakmica === idUtak)!;
      const [stadion] = await this.db
        .select()
        .from(schema.stadion)
        .where(eq(schema.stadion.idStadion, utakmica.idStadiona));

      const [{ zauzeto }] = await this.db
        .select({ zauzeto: sql<number>`count(*)` })
        .from(schema.stavkaKarte)
        .innerJoin(schema.karta, eq(schema.stavkaKarte.idKarte, schema.karta.idKarta))
        .where(and(
          eq(schema.stavkaKarte.idUtakmice, idUtak),
          ne(schema.karta.status, 'otkazana'),
        ));

     if (Number(zauzeto) >= stadion.kapacitet) {
  const [tim1] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, utakmica.tim1Id));
  const [tim2] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, utakmica.tim2Id));
  throw new BadRequestException(
    `Nema slobodnih mesta za utakmicu ${tim1?.naziv ?? '?'} — ${tim2?.naziv ?? '?'}.`
  );
}
    }
    const [prvenstvo] = await this.db.select().from(schema.prvenstvo).limit(1);
    const popustAktivan = prvenstvo?.datumPopustaDo
      ? new Date() <= new Date(prvenstvo.datumPopustaDo)
      : false;

    // obriši sve postojeće stavke i upiši nove (jednostavnije i sigurnije od poređenja razlike)
    await this.db.delete(schema.stavkaKarte).where(eq(schema.stavkaKarte.idKarte, karta.idKarta));

    for (const u of noveUtakmice) {
      await this.db.insert(schema.stavkaKarte).values({
        idKarte: karta.idKarta,
        idUtakmice: u.idUtakmica,
        cena: u.cenaKarte,
        popustPrimenjen: popustAktivan,
      });
    }

    const osnovnaCena = noveUtakmice.reduce((zbir, u) => zbir + Number(u.cenaKarte), 0);
    const cenaUEvrima = popustAktivan ? osnovnaCena * 0.9 : osnovnaCena;
    const novaUkupnaCena = cenaUEvrima * Number(karta.kursNaDanKupovine);

    const [azurirana] = await this.db
      .update(schema.karta)
      .set({ ukupnaCena: novaUkupnaCena.toFixed(2) })
      .where(eq(schema.karta.idKarta, karta.idKarta))
      .returning();

  const utakmiceZaDogadjaj = await Promise.all(noveUtakmice.map(async (u) => {
      const [tim1] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim1Id));
      const [tim2] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim2Id));
      return {
        idUtakmice: u.idUtakmica,
        naziv: `${tim1?.naziv ?? '?'} — ${tim2?.naziv ?? '?'}`,
        datum: u.datum,
      };
    }));
/*
await this.redis.xadd(
  STREAM_DOGADJAJI_KARATA, '*',
  'tip', 'izmenjena_karta',
  'idKarte', String(karta.idKarta),
  'utakmice', JSON.stringify(utakmiceZaDogadjaj),
  'datum', new Date().toISOString(),
);*/


await this.redis.xadd(STREAM_DOGADJAJI_KARATA, '*',
  'tip', 'izmenjena_karta',
  'idKarte', String(karta.idKarta),
  'utakmice', JSON.stringify(utakmiceZaDogadjaj),
  'datum', new Date().toISOString());
    return azurirana;
  }

  // --- FEATURE 5: otkazivanje karte ---
  async otkaziKartu(sifra: string, email: string) {
    const karta = await this.pronadjiKartuIliBaci(sifra, email);

    if (karta.status === 'otkazana') {
      throw new BadRequestException('Karta je već otkazana.');
    }

    const [azurirana] = await this.db
      .update(schema.karta)
      .set({ status: 'otkazana' })
      .where(eq(schema.karta.idKarta, karta.idKarta))
      .returning();

    // promo kod koji je OVA karta generisala postaje nevažeći
    await this.db
      .update(schema.promoKod)
      .set({ iskoriscen: true })
      .where(eq(schema.promoKod.kartaGenerisalaId, karta.idKarta));

    await this.redis.xadd(
      STREAM_DOGADJAJI_KARATA, '*',
      'tip', 'otkazana_karta',
      'idKarte', String(karta.idKarta),
      'datum', new Date().toISOString(),
    );

    return azurirana;
  }
}