import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.provider';
import { REDIS } from '../db/redis.provider';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';

const STREAM_DOGADJAJI_KARATA = 'stream:dogadjaji-karata';
const GRUPA = 'obrada-izvestavanje';
const POTROSAC = 'worker-a2-1';

function poljaUObjekat(polja: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < polja.length; i += 2) {
    obj[polja[i]] = polja[i + 1];
  }
  return obj;
}

@Injectable()
export class DogadjajiConsumer implements OnModuleInit {
  private readonly logger = new Logger(DogadjajiConsumer.name);

  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async onModuleInit() {
    try {
      await this.redis.xgroup('CREATE', STREAM_DOGADJAJI_KARATA, GRUPA, '0', 'MKSTREAM');
      this.logger.log('Consumer grupa za A.2 kreirana.');
    } catch (err: any) {
      if (!err.message.includes('BUSYGROUP')) throw err;
    }

    this.pokreniPetlju();
  }

  private async pokreniPetlju() {
    this.logger.log('A.2 konzument pokrenut, čeka događaje...');

    while (true) {
      try {
        const rezultat: any = await this.redis.xreadgroup(
          'GROUP', GRUPA, POTROSAC,
          'COUNT', 1,
          'BLOCK', 5000,
          'STREAMS', STREAM_DOGADJAJI_KARATA, '>',
        );

        if (!rezultat) continue;

        const [[, poruke]] = rezultat;
        for (const [idPoruke, polja] of poruke) {
          await this.obradiDogadjaj(idPoruke, poljaUObjekat(polja));
        }
      } catch (err) {
        this.logger.error('Greška u A.2 konzument petlji:', err);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  private async obradiDogadjaj(idPoruke: string, dogadjaj: Record<string, string>) {
  this.logger.log(`A.2: obrađujem događaj ${idPoruke}, tip=${dogadjaj.tip}`);

  try {
    if (dogadjaj.tip === 'kreirana_karta') {
      await this.obradiKreiranuKartu(dogadjaj);
    } else if (dogadjaj.tip === 'izmenjena_karta') {
      await this.obradiIzmenjenuKartu(dogadjaj);
    } else if (dogadjaj.tip === 'otkazana_karta') {
      this.logger.log(`Otkazivanje karte ${dogadjaj.idKarte} — ignorisano za statistiku (po zahtevu).`);
    }
  } catch (err) {
    this.logger.error(`A.2: greška pri obradi poruke ${idPoruke}, poruka se odbacuje:`, err);
  }

  // XACK se poziva UVEK, bez obzira na uspeh — sprečava beskonačno ponavljanje pokvarene poruke
  await this.redis.xack(STREAM_DOGADJAJI_KARATA, GRUPA, idPoruke);
}

 private async obradiKreiranuKartu(dogadjaj: Record<string, string>) {
  if (!dogadjaj.utakmice) {
    this.logger.warn('Poruka u starom formatu (bez punih podataka o utakmicama) — preskačem.');
    return;
  }

  const idKarte = Number(dogadjaj.idKarte);
  const utakmice: { idUtakmice: number; naziv: string; datum: string }[] = JSON.parse(dogadjaj.utakmice);
  // ... ostatak metode nepromenjen

    // Upiši/ažuriraj referentne podatke o utakmicama
    for (const u of utakmice) {
      const [postojeca] = await this.db
        .select()
        .from(schema.utakmicaRef)
        .where(eq(schema.utakmicaRef.idUtakmice, u.idUtakmice));

      if (!postojeca) {
        await this.db.insert(schema.utakmicaRef).values({
          idUtakmice: u.idUtakmice,
          naziv: u.naziv,
          datumOdigravanja: u.datum,
        });
      }
    }

    // Upiši kupovinu (ako već ne postoji, npr. usled ponovljene obrade)
    const [postojecaKupovina] = await this.db
      .select()
      .from(schema.kupovinaKarte)
      .where(eq(schema.kupovinaKarte.idKarte, idKarte));

    if (postojecaKupovina) return;

    const [novaKupovina] = await this.db.insert(schema.kupovinaKarte).values({
      idKarte,
      sifraKarte: dogadjaj.sifraKarte,
      datumKupovine: new Date(dogadjaj.datumKupovine),
    }).returning();

    for (const u of utakmice) {
      await this.db.insert(schema.stavkaKupovine).values({
        idKupovine: novaKupovina.id,
        idUtakmice: u.idUtakmice,
      });
    }

    this.logger.log(`A.2: upisana kupovina za kartu ${idKarte} (${utakmice.length} utakmica).`);
  }

  private async obradiIzmenjenuKartu(dogadjaj: Record<string, string>) {
    const idKarte = Number(dogadjaj.idKarte);
    const utakmice: { idUtakmice: number; naziv: string; datum: string }[] = JSON.parse(dogadjaj.utakmice);

    const [kupovina] = await this.db
      .select()
      .from(schema.kupovinaKarte)
      .where(eq(schema.kupovinaKarte.idKarte, idKarte));

    if (!kupovina) return; // ne bi trebalo da se desi, ali bezbedno preskačemo

    // Obriši stare stavke, upiši nove — isti obrazac kao izmena u A.1
    await this.db.delete(schema.stavkaKupovine).where(eq(schema.stavkaKupovine.idKupovine, kupovina.id));

    for (const u of utakmice) {
      const [postojeca] = await this.db
        .select()
        .from(schema.utakmicaRef)
        .where(eq(schema.utakmicaRef.idUtakmice, u.idUtakmice));

      if (!postojeca && u.naziv) {
        await this.db.insert(schema.utakmicaRef).values({
          idUtakmice: u.idUtakmice,
          naziv: u.naziv,
          datumOdigravanja: u.datum,
        });
      }

      await this.db.insert(schema.stavkaKupovine).values({
        idKupovine: kupovina.id,
        idUtakmice: u.idUtakmice,
      });
    }

    this.logger.log(`A.2: ažurirane stavke za kartu ${idKarte}.`);
  }
}