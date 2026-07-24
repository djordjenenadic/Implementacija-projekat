import { useEffect, useState } from 'react'
import {
  dohvatiPrvenstvo, azurirajPrvenstvo,
  dohvatiGrupe, dodajGrupu,
  dohvatiTimove, dodajTim,
  dohvatiStadione, dodajStadion, azurirajStadion,
  dohvatiValute, azurirajValutu, dodajValutu,
  dohvatiUtakmiceAdmin, azurirajUtakmicu, dodajUtakmicu,
} from '../api'
import type { Prvenstvo, Grupa, Tim, Stadion, ValutaBackend, UtakmicaBackend } from '../types'

type Tab = 'osnovno' | 'grupe' | 'stadioni' | 'utakmice' | 'valute'

const tabovi: { id: Tab; naziv: string }[] = [
  { id: 'osnovno', naziv: 'Osnovne informacije' },
  { id: 'grupe', naziv: 'Grupe i timovi' },
  { id: 'stadioni', naziv: 'Stadioni' },
  { id: 'utakmice', naziv: 'Utakmice' },
  { id: 'valute', naziv: 'Valute' },
]

interface NovaUtakmicaForma {
  datum: string
  vreme: string
  cenaKarte: string
  idStadiona: number
  tim1Id: number
  tim2Id: number
}

interface NoviStadionForma {
  naziv: string
  lokacija: string
  kapacitet: string
}

interface NovaValutaForma {
  naziv: string
  kod: string
  aktivna: boolean
}

function Administracija() {
  const [tab, setTab] = useState<Tab>('osnovno')
  const [ucitavanje, setUcitavanje] = useState(true)
  const [poruka, setPoruka] = useState('')

  const [prvenstvo, setPrvenstvo] = useState<Prvenstvo | null>(null)
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [timovi, setTimovi] = useState<Tim[]>([])
  const [stadioni, setStadioni] = useState<Stadion[]>([])
  const [valute, setValute] = useState<ValutaBackend[]>([])
  const [utakmice, setUtakmice] = useState<UtakmicaBackend[]>([])

  const [noviTim, setNoviTim] = useState<Record<number, string>>({})
  const [novaGrupaNaziv, setNovaGrupaNaziv] = useState('')
  const [novaUtakmica, setNovaUtakmica] = useState<NovaUtakmicaForma | null>(null)
  const [noviStadion, setNoviStadion] = useState<NoviStadionForma | null>(null)
  const [novaValuta, setNovaValuta] = useState<NovaValutaForma | null>(null)

  async function ucitajSve() {
    const [p, g, t, s, v, u] = await Promise.all([
      dohvatiPrvenstvo(), dohvatiGrupe(), dohvatiTimove(),
      dohvatiStadione(), dohvatiValute(), dohvatiUtakmiceAdmin(),
    ])
    setPrvenstvo(p); setGrupe(g); setTimovi(t); setStadioni(s); setValute(v); setUtakmice(u)
    setUcitavanje(false)
  }

  useEffect(() => { ucitajSve() }, [])

  function pokaziPoruku(tekst: string) {
    setPoruka(tekst)
    setTimeout(() => setPoruka(''), 2000)
  }

  // --- PRVENSTVO ---
  async function sacuvajPrvenstvo() {
    if (!prvenstvo) return
    const { idPrvenstva, ...podaci } = prvenstvo
    await azurirajPrvenstvo(idPrvenstva, podaci)
    pokaziPoruku('Izmene sačuvane.')
  }

  // --- GRUPE / TIMOVI ---
  async function dodajNovuGrupu() {
    if (!novaGrupaNaziv.trim() || !prvenstvo) return
    const nova = await dodajGrupu({ naziv: novaGrupaNaziv, idPrvenstva: prvenstvo.idPrvenstva })
    setGrupe([...grupe, nova])
    setNovaGrupaNaziv('')
  }

  async function dodajNoviTim(idGrupe: number) {
    const naziv = noviTim[idGrupe]
    if (!naziv?.trim()) return
    const novi = await dodajTim({ naziv, idGrupe })
    setTimovi([...timovi, novi])
    setNoviTim({ ...noviTim, [idGrupe]: '' })
  }

  // --- STADIONI ---
  async function sacuvajStadion(s: Stadion) {
    const { idStadion, ...podaci } = s
    await azurirajStadion(idStadion, podaci)
    pokaziPoruku('Izmene sačuvane.')
  }

  function otvoriFormuZaNoviStadion() {
    setNoviStadion({ naziv: '', lokacija: '', kapacitet: '' })
  }

  function otkaziNoviStadion() {
    setNoviStadion(null)
  }

  async function potvrdiNoviStadion() {
    if (!noviStadion) return
    if (!noviStadion.naziv.trim() || !noviStadion.lokacija.trim() || !noviStadion.kapacitet) {
      pokaziPoruku('Popuni sva polja.')
      return
    }
    const novi = await dodajStadion({
      naziv: noviStadion.naziv,
      lokacija: noviStadion.lokacija,
      kapacitet: Number(noviStadion.kapacitet),
    })
    setStadioni([...stadioni, novi])
    setNoviStadion(null)
    pokaziPoruku('Stadion dodat.')
  }

  // --- UTAKMICE ---
  async function sacuvajUtakmicu(u: UtakmicaBackend) {
    const { idUtakmica, ...podaci } = u
    await azurirajUtakmicu(idUtakmica, podaci)
    pokaziPoruku('Izmene sačuvane.')
  }

  function otvoriFormuZaNovuUtakmicu() {
    if (stadioni.length === 0 || timovi.length < 2) {
      pokaziPoruku('Potreban je bar jedan stadion i dva tima.')
      return
    }
    setNovaUtakmica({
      datum: new Date().toISOString().slice(0, 10),
      vreme: '18:00',
      cenaKarte: '50.00',
      idStadiona: stadioni[0].idStadion,
      tim1Id: timovi[0].idTim,
      tim2Id: timovi[1].idTim,
    })
  }

  function otkaziNovuUtakmicu() {
    setNovaUtakmica(null)
  }

  async function potvrdiNovuUtakmicu() {
    if (!novaUtakmica) return
    const nova = await dodajUtakmicu(novaUtakmica)
    setUtakmice([...utakmice, nova])
    setNovaUtakmica(null)
    pokaziPoruku('Utakmica zakazana.')
  }

  // --- VALUTE ---
  async function preokreniValutu(v: ValutaBackend) {
    const azurirana = await azurirajValutu(v.idValute, { aktivna: !v.aktivna })
    setValute(valute.map((x) => (x.idValute === v.idValute ? azurirana : x)))
  }

  function otvoriFormuZaNovuValutu() {
    setNovaValuta({ naziv: '', kod: '', aktivna: true })
  }

  function otkaziNovuValutu() {
    setNovaValuta(null)
  }

  async function potvrdiNovuValutu() {
    if (!novaValuta) return
    if (!novaValuta.naziv.trim() || !novaValuta.kod.trim()) {
      pokaziPoruku('Popuni sva polja.')
      return
    }
    const nova = await dodajValutu(novaValuta)
    setValute([...valute, nova])
    setNovaValuta(null)
    pokaziPoruku('Valuta dodata.')
  }

  if (ucitavanje || !prvenstvo) {
    return <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black uppercase mb-2">Administracija</h1>
      <p className="text-[#8B93A6] text-sm mb-10">Upravljanje podacima o prvenstvu.</p>

      <div className="flex gap-1 border-b border-white/10 mb-8 overflow-x-auto">
        {tabovi.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors
              ${tab === t.id ? 'border-[#C9A227] text-[#F4F1E9]' : 'border-transparent text-[#8B93A6] hover:text-[#F4F1E9]'}`}
          >
            {t.naziv}
          </button>
        ))}
      </div>

      {/* OSNOVNE INFORMACIJE */}
      {tab === 'osnovno' && (
        <div className="space-y-4">
          <input className="polje w-full" value={prvenstvo.naziv} placeholder="Naziv prvenstva"
            onChange={(e) => setPrvenstvo({ ...prvenstvo, naziv: e.target.value })} />
          <input className="polje w-full" value={prvenstvo.lokacija} placeholder="Lokacija"
            onChange={(e) => setPrvenstvo({ ...prvenstvo, lokacija: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input className="polje" type="date" value={prvenstvo.datumPocetka}
              onChange={(e) => setPrvenstvo({ ...prvenstvo, datumPocetka: e.target.value })} />
            <input className="polje" type="date" value={prvenstvo.datumZavrsetka}
              onChange={(e) => setPrvenstvo({ ...prvenstvo, datumZavrsetka: e.target.value })} />
          </div>
          <textarea className="polje w-full min-h-24" value={prvenstvo.opis ?? ''} placeholder="Dodatne informacije"
            onChange={(e) => setPrvenstvo({ ...prvenstvo, opis: e.target.value })} />
          <div>
            <label className="text-xs text-[#8B93A6] uppercase tracking-widest font-mono">
              Popust od 10% važi do
            </label>
            <input className="polje w-full mt-1" type="date" value={prvenstvo.datumPopustaDo ?? ''}
              onChange={(e) => setPrvenstvo({ ...prvenstvo, datumPopustaDo: e.target.value })} />
          </div>
          <button onClick={sacuvajPrvenstvo}
            className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide">
            Sačuvaj izmene
          </button>
        </div>
      )}

      {/* GRUPE I TIMOVI */}
      {tab === 'grupe' && (
        <div className="space-y-5">
          {grupe.map((g) => (
            <div key={g.idGrupa} className="bg-[#1A2332] border border-white/10 rounded-sm p-5">
              <p className="text-[#C9A227] font-mono text-xs uppercase tracking-widest mb-3">{g.naziv}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {timovi.filter((t) => t.idGrupe === g.idGrupa).map((t) => (
                  <span key={t.idTim} className="text-sm bg-white/5 px-3 py-1 rounded-sm">{t.naziv}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="polje flex-1" placeholder="Naziv novog tima"
                  value={noviTim[g.idGrupa] ?? ''}
                  onChange={(e) => setNoviTim({ ...noviTim, [g.idGrupa]: e.target.value })} />
                <button onClick={() => dodajNoviTim(g.idGrupa)}
                  className="px-4 text-sm border border-white/20 rounded-sm hover:border-[#C9A227]">
                  Dodaj tim
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input className="polje flex-1" placeholder="Naziv nove grupe"
              value={novaGrupaNaziv} onChange={(e) => setNovaGrupaNaziv(e.target.value)} />
            <button onClick={dodajNovuGrupu}
              className="px-4 text-sm border border-dashed border-white/20 rounded-sm hover:border-[#C9A227]">
              + Dodaj grupu
            </button>
          </div>
        </div>
      )}

      {/* STADIONI */}
      {tab === 'stadioni' && (
        <div className="space-y-3">
          {stadioni.map((s, i) => (
            <div key={s.idStadion} className="grid grid-cols-3 gap-3 bg-[#1A2332] border border-white/10 rounded-sm p-4">
              <input className="polje" value={s.naziv} placeholder="Naziv stadiona"
                onChange={(e) => { const n = [...stadioni]; n[i] = { ...s, naziv: e.target.value }; setStadioni(n) }} />
              <input className="polje" value={s.lokacija} placeholder="Lokacija"
                onChange={(e) => { const n = [...stadioni]; n[i] = { ...s, lokacija: e.target.value }; setStadioni(n) }} />
              <div className="flex gap-2">
                <input className="polje flex-1" type="number" value={s.kapacitet} placeholder="Kapacitet"
                  onChange={(e) => { const n = [...stadioni]; n[i] = { ...s, kapacitet: Number(e.target.value) }; setStadioni(n) }} />
                <button onClick={() => sacuvajStadion(stadioni[i])}
                  className="px-3 text-xs border border-white/20 rounded-sm hover:border-[#C9A227]">
                  Sačuvaj
                </button>
              </div>
            </div>
          ))}

          {noviStadion && (
            <div className="bg-[#1A2332] border border-[#C9A227]/40 rounded-sm p-4 space-y-3">
              <p className="text-[#C9A227] text-xs uppercase tracking-widest font-mono">Novi stadion</p>
              <div className="grid grid-cols-3 gap-3">
                <input className="polje" placeholder="Naziv stadiona" value={noviStadion.naziv}
                  onChange={(e) => setNoviStadion({ ...noviStadion, naziv: e.target.value })} />
                <input className="polje" placeholder="Lokacija" value={noviStadion.lokacija}
                  onChange={(e) => setNoviStadion({ ...noviStadion, lokacija: e.target.value })} />
                <input className="polje" type="number" placeholder="Kapacitet" value={noviStadion.kapacitet}
                  onChange={(e) => setNoviStadion({ ...noviStadion, kapacitet: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={otkaziNoviStadion} className="px-4 py-2 text-xs text-[#8B93A6] hover:text-[#F4F1E9]">
                  Otkaži
                </button>
                <button onClick={potvrdiNoviStadion}
                  className="px-4 py-2 text-xs bg-[#C9A227] text-[#0B1120] font-semibold rounded-sm hover:bg-[#dbb52f]">
                  Potvrdi dodavanje
                </button>
              </div>
            </div>
          )}

          {!noviStadion && (
            <button onClick={otvoriFormuZaNoviStadion}
              className="text-sm text-[#8B93A6] hover:text-[#C9A227] px-4 py-2 border border-dashed border-white/20 rounded-sm">
              + Dodaj stadion
            </button>
          )}
        </div>
      )}

      {/* UTAKMICE */}
      {tab === 'utakmice' && (
        <div className="space-y-4">
          {utakmice.map((u, i) => (
            <div key={u.idUtakmica} className="bg-[#1A2332] border border-white/10 rounded-sm p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select className="polje" value={u.tim1Id}
                  onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, tim1Id: Number(e.target.value) }; setUtakmice(n) }}>
                  {timovi.map((t) => <option key={t.idTim} value={t.idTim}>{t.naziv}</option>)}
                </select>
                <select className="polje" value={u.tim2Id}
                  onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, tim2Id: Number(e.target.value) }; setUtakmice(n) }}>
                  {timovi.map((t) => <option key={t.idTim} value={t.idTim}>{t.naziv}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input className="polje" type="date" value={u.datum}
                  onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, datum: e.target.value }; setUtakmice(n) }} />
                <input className="polje" type="time" value={u.vreme}
                  onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, vreme: e.target.value }; setUtakmice(n) }} />
                <select className="polje" value={u.idStadiona}
                  onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, idStadiona: Number(e.target.value) }; setUtakmice(n) }}>
                  {stadioni.map((s) => <option key={s.idStadion} value={s.idStadion}>{s.naziv}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[#8B93A6] text-sm">€</span>
                  <input className="polje w-full" placeholder="Cena" value={u.cenaKarte}
                    onChange={(e) => { const n = [...utakmice]; n[i] = { ...u, cenaKarte: e.target.value }; setUtakmice(n) }} />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => sacuvajUtakmicu(utakmice[i])}
                  className="px-4 py-2 text-xs border border-white/20 rounded-sm hover:border-[#C9A227]">
                  Sačuvaj
                </button>
              </div>
            </div>
          ))}

          {novaUtakmica && (
            <div className="bg-[#1A2332] border border-[#C9A227]/40 rounded-sm p-4 space-y-3">
              <p className="text-[#C9A227] text-xs uppercase tracking-widest font-mono">Nova utakmica</p>
              <div className="grid grid-cols-2 gap-3">
                <select className="polje" value={novaUtakmica.tim1Id}
                  onChange={(e) => setNovaUtakmica({ ...novaUtakmica, tim1Id: Number(e.target.value) })}>
                  {timovi.map((t) => <option key={t.idTim} value={t.idTim}>{t.naziv}</option>)}
                </select>
                <select className="polje" value={novaUtakmica.tim2Id}
                  onChange={(e) => setNovaUtakmica({ ...novaUtakmica, tim2Id: Number(e.target.value) })}>
                  {timovi.map((t) => <option key={t.idTim} value={t.idTim}>{t.naziv}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input className="polje" type="date" value={novaUtakmica.datum}
                  onChange={(e) => setNovaUtakmica({ ...novaUtakmica, datum: e.target.value })} />
                <input className="polje" type="time" value={novaUtakmica.vreme}
                  onChange={(e) => setNovaUtakmica({ ...novaUtakmica, vreme: e.target.value })} />
                <select className="polje" value={novaUtakmica.idStadiona}
                  onChange={(e) => setNovaUtakmica({ ...novaUtakmica, idStadiona: Number(e.target.value) })}>
                  {stadioni.map((s) => <option key={s.idStadion} value={s.idStadion}>{s.naziv}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[#8B93A6] text-sm">€</span>
                  <input className="polje w-full" placeholder="Cena" value={novaUtakmica.cenaKarte}
                    onChange={(e) => setNovaUtakmica({ ...novaUtakmica, cenaKarte: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={otkaziNovuUtakmicu} className="px-4 py-2 text-xs text-[#8B93A6] hover:text-[#F4F1E9]">
                  Otkaži
                </button>
                <button onClick={potvrdiNovuUtakmicu}
                  className="px-4 py-2 text-xs bg-[#C9A227] text-[#0B1120] font-semibold rounded-sm hover:bg-[#dbb52f]">
                  Potvrdi zakazivanje
                </button>
              </div>
            </div>
          )}

          {!novaUtakmica && (
            <button onClick={otvoriFormuZaNovuUtakmicu}
              className="text-sm text-[#8B93A6] hover:text-[#C9A227] px-4 py-2 border border-dashed border-white/20 rounded-sm">
              + Zakaži utakmicu
            </button>
          )}
        </div>
      )}

      {/* VALUTE */}
      {tab === 'valute' && (
        <div className="space-y-3">
          {valute.map((v) => (
            <div key={v.idValute} className="flex items-center justify-between bg-[#1A2332] border border-white/10 rounded-sm p-4">
              <div>
                <p className="text-sm font-medium">{v.naziv}</p>
                <p className="text-xs text-[#8B93A6] font-mono">{v.kod}</p>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <span className="text-[#8B93A6]">{v.aktivna ? 'Dozvoljena' : 'Isključena'}</span>
                <input type="checkbox" checked={v.aktivna} onChange={() => preokreniValutu(v)}
                  className="w-4 h-4 accent-[#C9A227]" />
              </label>
            </div>
          ))}

          {novaValuta && (
            <div className="bg-[#1A2332] border border-[#C9A227]/40 rounded-sm p-4 space-y-3">
              <p className="text-[#C9A227] text-xs uppercase tracking-widest font-mono">Nova valuta</p>
              <div className="grid grid-cols-2 gap-3">
                <input className="polje" placeholder="Naziv (npr. Britanska funta)" value={novaValuta.naziv}
                  onChange={(e) => setNovaValuta({ ...novaValuta, naziv: e.target.value })} />
                <input className="polje" placeholder="Kod (npr. GBP)" maxLength={3} value={novaValuta.kod}
                  onChange={(e) => setNovaValuta({ ...novaValuta, kod: e.target.value.toUpperCase() })} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={otkaziNovuValutu} className="px-4 py-2 text-xs text-[#8B93A6] hover:text-[#F4F1E9]">
                  Otkaži
                </button>
                <button onClick={potvrdiNovuValutu}
                  className="px-4 py-2 text-xs bg-[#C9A227] text-[#0B1120] font-semibold rounded-sm hover:bg-[#dbb52f]">
                  Potvrdi dodavanje
                </button>
              </div>
            </div>
          )}

          {!novaValuta && (
            <button onClick={otvoriFormuZaNovuValutu}
              className="text-sm text-[#8B93A6] hover:text-[#C9A227] px-4 py-2 border border-dashed border-white/20 rounded-sm">
              + Dodaj valutu
            </button>
          )}
        </div>
      )}

      {poruka && <p className="text-[#C9A227] text-sm mt-6">{poruka}</p>}
    </div>
  )
}

export default Administracija