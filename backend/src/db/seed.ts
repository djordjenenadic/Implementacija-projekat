import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Brišem postojeće podatke...');
await db.delete(schema.koriscenjePromoKoda);
await db.delete(schema.promoKod);
await db.delete(schema.stavkaKarte);  
await db.delete(schema.karta);
await db.delete(schema.utakmica);      
await db.delete(schema.tim);
await db.delete(schema.grupa);
await db.delete(schema.stadion);
await db.delete(schema.valuta);
await db.delete(schema.prvenstvo);

  console.log('Ubacujem Prvenstvo...');
  const [prvenstvo] = await db.insert(schema.prvenstvo).values({
    naziv: 'Svetsko prvenstvo u košarci 2027',
    lokacija: 'Katar',
    datumPocetka: '2027-08-15',
    datumZavrsetka: '2027-09-01',
    opis: '16 reprezentacija, četiri grupe.',
    datumPopustaDo: '2027-06-01',
  }).returning();

  console.log('Ubacujem Grupe...');
  const [grupaA] = await db.insert(schema.grupa).values({
    naziv: 'Grupa A',
    idPrvenstva: prvenstvo.idPrvenstva,
  }).returning();

  const [grupaB] = await db.insert(schema.grupa).values({
    naziv: 'Grupa B',
    idPrvenstva: prvenstvo.idPrvenstva,
  }).returning();

  console.log('Ubacujem Timove...');
  const [srbija] = await db.insert(schema.tim).values({ naziv: 'Srbija', idGrupe: grupaA.idGrupa }).returning();
  const [francuska] = await db.insert(schema.tim).values({ naziv: 'Francuska', idGrupe: grupaA.idGrupa }).returning();
  await db.insert(schema.tim).values({ naziv: 'SAD', idGrupe: grupaB.idGrupa });
  await db.insert(schema.tim).values({ naziv: 'Katar', idGrupe: grupaB.idGrupa });

  console.log('Ubacujem Stadion...');
  const [stadion] = await db.insert(schema.stadion).values({
    naziv: 'Lusail Stadium',
    lokacija: 'Lusail',
    kapacitet: 88000,
  }).returning();

  console.log('Ubacujem Valute...');
  await db.insert(schema.valuta).values([
    { naziv: 'Evro', kod: 'EUR', aktivna: true },
    { naziv: 'Američki dolar', kod: 'USD', aktivna: true },
  ]);

  console.log('Ubacujem Utakmicu...');
  await db.insert(schema.utakmica).values({
    datum: '2027-08-20',
    vreme: '20:00',
    cenaKarte: '80.00',
    idStadiona: stadion.idStadion,
    tim1Id: srbija.idTim,
    tim2Id: francuska.idTim,
  });

  console.log('Gotovo!');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});