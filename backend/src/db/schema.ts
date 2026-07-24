import {
  pgTable, integer, varchar, date, time, numeric, boolean, text, timestamp, primaryKey,
} from 'drizzle-orm/pg-core';

export const prvenstvo = pgTable('prvenstvo', {
  idPrvenstva: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  naziv: varchar('naziv', { length: 200 }).notNull(),
  lokacija: varchar('lokacija', { length: 200 }).notNull(),
  datumPocetka: date('datumPocetka').notNull(),
  datumZavrsetka: date('datumZavrsetka').notNull(),
  opis: text('opis'),
  datumPopustaDo: date('datumPopustaDo'),
});

export const grupa = pgTable('grupa', {
  idGrupa: integer('idGrupa').primaryKey().generatedAlwaysAsIdentity(),
  naziv: varchar('naziv', { length: 50 }).notNull(),
  idPrvenstva: integer('idPrvenstva').notNull().references(() => prvenstvo.idPrvenstva),
});

export const tim = pgTable('tim', {
  idTim: integer('idTim').primaryKey().generatedAlwaysAsIdentity(),
  naziv: varchar('naziv', { length: 100 }).notNull(),
  idGrupe: integer('idGrupe').notNull().references(() => grupa.idGrupa),
});

export const stadion = pgTable('stadion', {
  idStadion: integer('idStadion').primaryKey().generatedAlwaysAsIdentity(),
  naziv: varchar('naziv', { length: 150 }).notNull(),
  lokacija: varchar('lokacija', { length: 150 }).notNull(),
  kapacitet: integer('kapacitet').notNull(),
});

export const utakmica = pgTable('utakmica', {
  idUtakmica: integer('idUtakmica').primaryKey().generatedAlwaysAsIdentity(),
  datum: date('datum').notNull(),
  vreme: time('vreme').notNull(),
  cenaKarte: numeric('cenaKarte', { precision: 10, scale: 2 }).notNull(),
  idStadiona: integer('idStadiona').notNull().references(() => stadion.idStadion),
  tim1Id: integer('tim1Id').notNull().references(() => tim.idTim),
  tim2Id: integer('tim2Id').notNull().references(() => tim.idTim),
});

export const valuta = pgTable('valuta', {
  idValute: integer('idValute').primaryKey().generatedAlwaysAsIdentity(),
  naziv: varchar('naziv', { length: 50 }).notNull(),
  kod: varchar('kod', { length: 3 }).notNull(),
  aktivna: boolean('aktivna').notNull().default(true),
});

export const karta = pgTable('karta', {
  idKarta: integer('idKarta').primaryKey().generatedAlwaysAsIdentity(),
  sifra: varchar('sifra', { length: 20 }).notNull().unique(),
  ime: varchar('ime', { length: 100 }).notNull(),
  prezime: varchar('prezime', { length: 100 }).notNull(),
  adresa1: varchar('adresa1', { length: 200 }).notNull(),
  postanskiBroj: varchar('postanskiBroj', { length: 20 }).notNull(),
  mesto: varchar('mesto', { length: 100 }).notNull(),
  drzava: varchar('drzava', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  emailPotvrdjen: boolean('emailPotvrdjen').notNull().default(false),
  status: varchar('status', { length: 30 }).notNull().default('na_cekanju'),
  ukupnaCena: numeric('ukupnaCena', { precision: 10, scale: 2 }).notNull(),
  kursNaDanKupovine: numeric('kursNaDanKupovine', { precision: 10, scale: 4 }).notNull(),
  idValute: integer('idValute').notNull().references(() => valuta.idValute),
  datumKreiranja: timestamp('datumKreiranja').notNull().defaultNow(),
});

export const stavkaKarte = pgTable('stavkaKarte', {
  idKarte: integer('idKarte').notNull().references(() => karta.idKarta),
  idUtakmice: integer('idUtakmice').notNull().references(() => utakmica.idUtakmica),
  cena: numeric('cena', { precision: 10, scale: 2 }).notNull(),
  popustPrimenjen: boolean('popustPrimenjen').notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.idKarte, t.idUtakmice] }),
}));

export const promoKod = pgTable('promoKod', {
  idPromoKod: integer('idPromoKod').primaryKey().generatedAlwaysAsIdentity(),
  kod: varchar('kod', { length: 20 }).notNull().unique(),
  iskoriscen: boolean('iskoriscen').notNull().default(false),
  kartaGenerisalaId: integer('kartaGenerisalaId').notNull().references(() => karta.idKarta).unique(),
});

export const koriscenjePromoKoda = pgTable('koriscenjePromoKoda', {
  idPromoKoda: integer('idPromoKoda').primaryKey().references(() => promoKod.idPromoKod),
  kartaIskoristilaId: integer('kartaIskoristilaId').notNull().references(() => karta.idKarta).unique(),
});