export interface KreirajKupovinuDto {
  ime: string;
  prezime: string;
  adresa1: string;
  postanskiBroj: string;
  mesto: string;
  drzava: string;
  email: string;
  utakmiceId: number[];
  idValute: number;
  promoKodZaKoriscenje?: string;
}