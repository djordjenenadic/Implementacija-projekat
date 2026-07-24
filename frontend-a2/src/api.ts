import type { StatistikaUtakmice, StatistikaDana } from './types'

const API_URL = 'http://localhost:3001'

export async function dohvatiStatistikuPoUtakmici(): Promise<StatistikaUtakmice[]> {
  const odgovor = await fetch(`${API_URL}/statistika/po-utakmici`)
  return odgovor.json()
}

export async function dohvatiStatistikuPoDanima(odDatuma?: string): Promise<StatistikaDana[]> {
  const putanja = odDatuma
    ? `${API_URL}/statistika/po-danima?od=${odDatuma}`
    : `${API_URL}/statistika/po-danima`
  const odgovor = await fetch(putanja)
  return odgovor.json()
}