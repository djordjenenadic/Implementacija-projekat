export interface Tim {
  idTim: number
  naziv: string
  idGrupe: number
}

export interface Grupa {
  idGrupa: number
  naziv: string
  idPrvenstva: number
  timovi: Tim[]
}

export interface Prvenstvo {
  idPrvenstva: number
  naziv: string
  lokacija: string
  datumPocetka: string
  datumZavrsetka: string
  opis: string | null
  datumPopustaDo: string | null
}
export interface Stadion {
  idStadion: number
  naziv: string
  lokacija: string
  kapacitet: number
}

export interface ValutaBackend {
  idValute: number
  naziv: string
  kod: string
  aktivna: boolean
}

export interface UtakmicaBackend {
  idUtakmica: number
  datum: string
  vreme: string
  cenaKarte: string
  idStadiona: number
  tim1Id: number
  tim2Id: number
}

export interface KreirajKupovinuDto {
  ime: string
  prezime: string
  adresa1: string
  postanskiBroj: string
  mesto: string
  drzava: string
  email: string
  utakmiceId: number[]
  idValute: number
  promoKodZaKoriscenje?: string
}

export interface StatusKupovine {
  status: 'obrada' | 'gotovo' | 'greska' | 'nepoznato'
  sifra?: string
  ukupnaCena?: string
  valutaKod?: string
  noviPromoKod?: string
  poruka?: string
}
export interface KartaBackend {
  idKarta: number
  sifra: string
  ime: string
  prezime: string
  email: string
  status: string
  ukupnaCena: string
  idValute: number
  stavke: { idKarte: number; idUtakmice: number; cena: string; popustPrimenjen: boolean }[]
}