import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { eq, inArray,ne,sql,and } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import { REDIS } from '../db/redis.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { STREAM_KUPOVINE } from './karta.service';
function kljucStatusa(idPoruke: string) {
  return `status:kupovina:${idPoruke}`;
}
export const STREAM_DOGADJAJI_KARATA = 'stream:dogadjaji-karata';
const GRUPA = 'obrada-kupovina';
const POTROSAC = 'worker-1';

function poljaUObjekat(polja: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < polja.length; i += 2) {
    obj[polja[i]] = polja[i + 1];
  }
  return obj;
}

function generisiSlucajniString(duzina: number): string {
  const znakovi = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rezultat = '';
  for (let i = 0; i < duzina; i++) {
    rezultat += znakovi[Math.floor(Math.random() * znakovi.length)];
  }
  return rezultat;
}

@Injectable()
export class KartaConsumer implements OnModuleInit {
  private readonly logger = new Logger(KartaConsumer.name);

  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async onModuleInit() {
    try {
      await this.redis.xgroup('CREATE', STREAM_KUPOVINE, GRUPA, '0', 'MKSTREAM');//
      this.logger.log('Consumer grupa kreirana.');
    } catch (err: any) {
      if (!err.message.includes('BUSYGROUP')) throw err;
      // BUSYGROUP znači da grupa već postoji — potpuno u redu, samo nastavljamo
    }

    this.pokreniPetlju();
  }

  private async pokreniPetlju() {
    this.logger.log('Konzument pokrenut, čeka poruke na queue-u...');

    while (true) {
      try {
        const rezultat: any = await this.redis.xreadgroup(
  'GROUP', GRUPA, POTROSAC,
  'COUNT', 1,
  'BLOCK', 5000,
  'STREAMS', STREAM_KUPOVINE, '>',
);

        if (!rezultat) continue; // nema novih poruka u poslednjih 5 sekundi, pitaj ponovo

        const [[, poruke]] = rezultat;
        for (const [idPoruke, polja] of poruke) {
          await this.obradiPoruku(idPoruke, poljaUObjekat(polja));
        }
      } catch (err) {
        this.logger.error('Greška u konzument petlji:', err);
        await new Promise((r) => setTimeout(r, 2000)); // sačekaj malo pre novog pokušaja
      }
    }
  }

  private async obradiPoruku(idPoruke: string, poruka: Record<string, string>) {
    this.logger.log(`Obrađujem poruku ${idPoruke}...`);

    const utakmiceId: number[] = JSON.parse(poruka.utakmiceId);
    const idValute = Number(poruka.idValute);

    // 1. Proveri da sve utakmice postoje
    const utakmice = await this.db
      .select()
      .from(schema.utakmica)
      .where(inArray(schema.utakmica.idUtakmica, utakmiceId));

    if (utakmice.length !== utakmiceId.length) {
  this.logger.error(`Poruka ${idPoruke}: neke utakmice ne postoje. Odbačeno.`);
  await this.redis.set(kljucStatusa(idPoruke), JSON.stringify({
    status: 'greska',
    poruka: 'Jedna ili više izabranih utakmica ne postoje.',
  }), 'EX', 3600);
  await this.redis.xack(STREAM_KUPOVINE, GRUPA, idPoruke);
  return;
}
 for (const u of utakmice) {
  const [stadion] = await this.db
    .select()
    .from(schema.stadion)
    .where(eq(schema.stadion.idStadion, u.idStadiona));

  const [{ zauzeto }] = await this.db
    .select({ zauzeto: sql<number>`count(*)` })
    .from(schema.stavkaKarte)
    .innerJoin(schema.karta, eq(schema.stavkaKarte.idKarte, schema.karta.idKarta))
    .where(and(
      eq(schema.stavkaKarte.idUtakmice, u.idUtakmica),
      ne(schema.karta.status, 'otkazana'),
    ));

  if (Number(zauzeto) >= stadion.kapacitet) {
  const [tim1] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim1Id));
  const [tim2] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim2Id));
  const nazivUtakmice = `${tim1?.naziv ?? '?'} — ${tim2?.naziv ?? '?'}`;

  this.logger.error(`Poruka ${idPoruke}: nema slobodnih mesta za utakmicu ${nazivUtakmice}.`);
  await this.redis.set(kljucStatusa(idPoruke), JSON.stringify({
    status: 'greska',
    poruka: `Nema slobodnih mesta za utakmicu ${nazivUtakmice}.`,
  }), 'EX', 3600);
  await this.redis.xack(STREAM_KUPOVINE, GRUPA, idPoruke);
  return;
}}

   try{ // 2. Proveri da li rani popust (10%) važi
    const [prvenstvo] = await this.db.select().from(schema.prvenstvo).limit(1);
    const popustAktivan = prvenstvo?.datumPopustaDo
      ? new Date() <= new Date(prvenstvo.datumPopustaDo)
      : false;

    // 3. Obračun osnovne cene
    const osnovnaCena = utakmice.reduce((zbir, u) => zbir + Number(u.cenaKarte), 0);
    let cenaNakonPopusta = popustAktivan ? osnovnaCena * 0.9 : osnovnaCena;

    // 4. Provera i primena promo koda (ako je poslat)
    let iskoriscenPromoKod: typeof schema.promoKod.$inferSelect | null = null;
    if (poruka.promoKodZaKoriscenje) {
      const [kod] = await this.db
        .select()
        .from(schema.promoKod)
        .where(eq(schema.promoKod.kod, poruka.promoKodZaKoriscenje));

      if (kod && !kod.iskoriscen) {
        iskoriscenPromoKod = kod;
        cenaNakonPopusta = cenaNakonPopusta * 0.95;
      }
    }

    // 5. Kurs valute — eksterni API (osim ako je EUR, referentna valuta)
    const [valuta] = await this.db
      .select()
      .from(schema.valuta)
      .where(eq(schema.valuta.idValute, idValute));

    let kurs = 1;
    if (valuta.kod !== 'EUR') {
      const odgovor = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${valuta.kod}`);
      const podaci = await odgovor.json();
      kurs = podaci.rates[valuta.kod];
    }

    const ukupnaCena = cenaNakonPopusta * kurs;

    // 6. Generiši šifru (garantovano jedinstvenu)
    let sifra = generisiSlucajniString(8);
    while (true) {
      const [postojeca] = await this.db.select().from(schema.karta).where(eq(schema.karta.sifra, sifra));
      if (!postojeca) break;
      sifra = generisiSlucajniString(8);
    }

    // 7. Upiši kartu
    const [novaKarta] = await this.db.insert(schema.karta).values({
      sifra,
      ime: poruka.ime,
      prezime: poruka.prezime,
      adresa1: poruka.adresa1,
      postanskiBroj: poruka.postanskiBroj,
      mesto: poruka.mesto,
      drzava: poruka.drzava,
      email: poruka.email,
      emailPotvrdjen: false,
      status: 'aktivna',
      ukupnaCena: ukupnaCena.toFixed(2),
      kursNaDanKupovine: kurs.toFixed(4),
      idValute,
    }).returning();

    // 8. Upiši stavke (po jedna po utakmici)
    for (const u of utakmice) {
      await this.db.insert(schema.stavkaKarte).values({
        idKarte: novaKarta.idKarta,
        idUtakmice: u.idUtakmica,
        cena: u.cenaKarte,
        popustPrimenjen: popustAktivan || !!iskoriscenPromoKod,
      });
    }

    // 9. Generiši NOVI promo kod za ovu kartu (garantovano jedinstven)
    let noviPromoKod = generisiSlucajniString(6);
    while (true) {
      const [postojeci] = await this.db.select().from(schema.promoKod).where(eq(schema.promoKod.kod, noviPromoKod));
      if (!postojeci) break;
      noviPromoKod = generisiSlucajniString(6);
    }
    await this.db.insert(schema.promoKod).values({
      kod: noviPromoKod,
      kartaGenerisalaId: novaKarta.idKarta,
    });

    // 10. Ako je korišćen tuđi promo kod, obeleži ga kao iskorišćen
    if (iskoriscenPromoKod) {
      await this.db.update(schema.promoKod)
        .set({ iskoriscen: true })
        .where(eq(schema.promoKod.idPromoKod, iskoriscenPromoKod.idPromoKod));

      await this.db.insert(schema.koriscenjePromoKoda).values({
        idPromoKoda: iskoriscenPromoKod.idPromoKod,
        kartaIskoristilaId: novaKarta.idKarta,
      });
    }

    await this.redis.set(kljucStatusa(idPoruke), JSON.stringify({
  status: 'gotovo',
  sifra,
  noviPromoKod,
  idKarte: novaKarta.idKarta,
  ukupnaCena: ukupnaCena.toFixed(2),
  valutaKod: valuta.kod,
  
}), 'EX', 3600);

   // 11. Objavi događaj za A.2 portal — sa punim podacima o utakmicama, ne samo ID-jevima
const utakmiceZaDogadjaj = await Promise.all(
  utakmice.map(async (u) => {
    const [tim1] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim1Id));
    const [tim2] = await this.db.select().from(schema.tim).where(eq(schema.tim.idTim, u.tim2Id));
    return {
      idUtakmice: u.idUtakmica,
      naziv: `${tim1?.naziv ?? '?'} — ${tim2?.naziv ?? '?'}`,
      datum: u.datum,
    };
  }),
);

await this.redis.xadd(
  STREAM_DOGADJAJI_KARATA,
  '*',
  'tip', 'kreirana_karta',
  'idKarte', String(novaKarta.idKarta),
  'sifraKarte', sifra,
  'utakmice', JSON.stringify(utakmiceZaDogadjaj),
  'datumKupovine', novaKarta.datumKreiranja.toISOString(),
);

    this.logger.log(`Karta kreirana: ${sifra} (id ${novaKarta.idKarta})`);
   }
   catch (err) {
      this.logger.error(`Greška pri obradi poruke ${idPoruke}:`, err);
      await this.redis.set(kljucStatusa(idPoruke), JSON.stringify({
        status: 'greska',
        poruka: 'Došlo je do greške prilikom obrade kupovine. Pokušajte ponovo.',
      }), 'EX', 3600);}
      finally{
    // 12. Potvrdi da je poruka uspešno obrađena
    await this.redis.xack(STREAM_KUPOVINE, GRUPA, idPoruke);}
  }
}