//sluzi trenutno dok pravimo samo frontend

import type { Grupa, Prvenstvo } from './types'
import type { Utakmica, Valuta } from './types'
export const prvenstvo: Prvenstvo = {
  naziv: 'Svetsko prvenstvo u košarci 2027',
  lokacija: 'Katar',
  datumPocetka: '15. avgust 2027',
  datumZavrsetka: '1. septembar 2027',
  opis: '16 reprezentacija, četiri grupe. Pratite raspored grupne faze i obezbedite kartu za utakmice koje ne smete propustiti.',
}

export const grupe: Grupa[] = [
  { oznaka: 'A', timovi: [{ naziv: 'Katar' }, { naziv: 'Srbija' }, { naziv: 'Francuska' }, { naziv: 'Australija' }] },
  { oznaka: 'B', timovi: [{ naziv: 'SAD' }, { naziv: 'Nemačka' }, { naziv: 'Kanada' }, { naziv: 'Litvanija' }] },
  { oznaka: 'C', timovi: [{ naziv: 'Španija' }, { naziv: 'Slovenija' }, { naziv: 'Brazil' }, { naziv: 'Grčka' }] },
  { oznaka: 'D', timovi: [{ naziv: 'Italija' }, { naziv: 'Argentina' }, { naziv: 'Japan' }, { naziv: 'Nigerija' }] },
]


export const utakmice: Utakmica[] = [
  { id: 1, tim1: 'Srbija', tim2: 'Francuska', datum: '20. avgust 2027', cenaKarte: 80 },
  { id: 2, tim1: 'Katar', tim2: 'SAD', datum: '21. avgust 2027', cenaKarte: 95 },
  { id: 3, tim1: 'Španija', tim2: 'Slovenija', datum: '22. avgust 2027', cenaKarte: 70 },
  { id: 4, tim1: 'Italija', tim2: 'Argentina', datum: '23. avgust 2027', cenaKarte: 65 },
  { id: 5, tim1: 'Nemačka', tim2: 'Kanada', datum: '24. avgust 2027', cenaKarte: 60 },
  { id: 6, tim1: 'Brazil', tim2: 'Grčka', datum: '25. avgust 2027', cenaKarte: 60 },
]

export const valute: Valuta[] = [
  { kod: 'EUR', naziv: 'Evro', kursUEvrima: 1 },
  { kod: 'USD', naziv: 'Američki dolar', kursUEvrima: 1.08 },
  { kod: 'RSD', naziv: 'Srpski dinar', kursUEvrima: 117.3 },
]

// Datum do kog važi popust od 10% — mock, u pravoj implementaciji dolazi iz Prvenstvo entiteta
export const popustAktivan = true

// Mock "postojeća karta" u bazi — koristi ovo za testiranje Izmene i Otkazivanja
export const mockKarta = {
  sifra: 'DEMO1234',
  email: 'test@test.com',
  utakmiceId: [1, 3], // Srbija-Francuska i Španija-Slovenija
}
import type { Stadion } from './types'

export const stadioni: Stadion[] = [
  { id: 1, naziv: 'Lusail Stadium', lokacija: 'Lusail', kapacitet: 88000 },
  { id: 2, naziv: 'Al Bayt Stadium', lokacija: 'Al Khor', kapacitet: 60000 },
  { id: 3, naziv: 'Education City Stadium', lokacija: 'Ar-Rajjan', kapacitet: 45000 },
]