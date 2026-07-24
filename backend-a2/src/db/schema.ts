import { pgTable, integer, varchar, date, time, timestamp } from 'drizzle-orm/pg-core';

export const utakmicaRef = pgTable('utakmicaRef', {
  idUtakmice: integer('idUtakmice').primaryKey(),
  naziv: varchar('naziv', { length: 200 }).notNull(),
  datumOdigravanja: date('datumOdigravanja').notNull(),
});

export const kupovinaKarte = pgTable('kupovinaKarte', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  idKarte: integer('idKarte').notNull().unique(),
  sifraKarte: varchar('sifraKarte', { length: 20 }),
  datumKupovine: timestamp('datumKupovine').notNull(),
});

export const stavkaKupovine = pgTable('stavkaKupovine', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  idKupovine: integer('idKupovine').notNull().references(() => kupovinaKarte.id),
  idUtakmice: integer('idUtakmice').notNull().references(() => utakmicaRef.idUtakmice),
});