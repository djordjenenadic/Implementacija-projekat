import type { KreirajKupovinuDto,StatusKupovine,Prvenstvo, Grupa, Tim, Stadion, ValutaBackend, UtakmicaBackend,KartaBackend } from './types'

const API_URL = 'http://localhost:3000'

async function get<T>(putanja: string): Promise<T> {
  const odgovor = await fetch(`${API_URL}${putanja}`)
  return odgovor.json()
}

async function post<T>(putanja: string, telo: unknown): Promise<T> {
  const odgovor = await fetch(`${API_URL}${putanja}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telo),
  })
  return odgovor.json()
}

async function patch<T>(putanja: string, telo: unknown): Promise<T> {
  const odgovor = await fetch(`${API_URL}${putanja}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telo),
  })
  return odgovor.json()
}

async function del(putanja: string): Promise<void> {
  await fetch(`${API_URL}${putanja}`, { method: 'DELETE' })
}

// Prvenstvo
export async function dohvatiPrvenstvo(): Promise<Prvenstvo> {
  const sva = await get<Prvenstvo[]>('/prvenstvo')
  return sva[0]
}
export const azurirajPrvenstvo = (id: number, podaci: Partial<Prvenstvo>) =>
  patch<Prvenstvo>(`/prvenstvo/${id}`, podaci)

// Grupa
export const dohvatiGrupe = () => get<Grupa[]>('/grupa')
export const dodajGrupu = (podaci: { naziv: string; idPrvenstva: number }) =>
  post<Grupa>('/grupa', podaci)

// Tim
export const dohvatiTimove = () => get<Tim[]>('/tim')
export const dodajTim = (podaci: { naziv: string; idGrupe: number }) =>
  post<Tim>('/tim', podaci)

// Stadion
export const dohvatiStadione = () => get<Stadion[]>('/stadion')
export const dodajStadion = (podaci: { naziv: string; lokacija: string; kapacitet: number }) =>
  post<Stadion>('/stadion', podaci)
export const azurirajStadion = (id: number, podaci: Partial<Stadion>) =>
  patch<Stadion>(`/stadion/${id}`, podaci)

// Valuta
export const dohvatiValute = () => get<ValutaBackend[]>('/valuta')
export const azurirajValutu = (id: number, podaci: Partial<ValutaBackend>) =>
  patch<ValutaBackend>(`/valuta/${id}`, podaci)

// Utakmica
export const dohvatiUtakmiceAdmin = () => get<UtakmicaBackend[]>('/utakmica')
export const azurirajUtakmicu = (id: number, podaci: Partial<UtakmicaBackend>) =>
  patch<UtakmicaBackend>(`/utakmica/${id}`, podaci)

export const dodajUtakmicu = (podaci: {
  datum: string; vreme: string; cenaKarte: string;
  idStadiona: number; tim1Id: number; tim2Id: number;
}) => post<UtakmicaBackend>('/utakmica', podaci)

export const dodajValutu = (podaci: { naziv: string; kod: string; aktivna: boolean }) =>
  post<ValutaBackend>('/valuta', podaci)

export const kupiKartu = (dto: KreirajKupovinuDto) =>
  post<{ status: string; idPoruke: string }>('/karta', dto)

export const dohvatiStatusKupovine = (idPoruke: string) =>
  get<StatusKupovine>(`/karta/${idPoruke}/status`)

export async function pronadjiKartu(sifra: string, email: string): Promise<KartaBackend> {
  const odgovor = await fetch(`${API_URL}/karta/pronadji?sifra=${encodeURIComponent(sifra)}&email=${encodeURIComponent(email)}`)
  if (!odgovor.ok) {
    const greska = await odgovor.json()
    throw new Error(greska.message ?? 'Karta nije pronađena.')
  }
  return odgovor.json()
}

export async function izmeniKartu(sifra: string, email: string, utakmiceId: number[]): Promise<KartaBackend> {
  const odgovor = await fetch(`${API_URL}/karta/izmeni`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sifra, email, utakmiceId }),
  })
  if (!odgovor.ok) {
    const greska = await odgovor.json()
    throw new Error(greska.message ?? 'Izmena nije uspela.')
  }
  return odgovor.json()
}

export async function otkaziKartu(sifra: string, email: string): Promise<KartaBackend> {
  const odgovor = await fetch(`${API_URL}/karta/otkazi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sifra, email }),
  })
  if (!odgovor.ok) {
    const greska = await odgovor.json()
    throw new Error(greska.message ?? 'Otkazivanje nije uspelo.')
  }
  return odgovor.json()
}