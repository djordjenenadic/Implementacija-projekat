import { useEffect, useState, useRef } from 'react'
import {proveriPromoKod, dohvatiUtakmiceAdmin, dohvatiTimove, dohvatiValute, dohvatiPrvenstvo, kupiKartu, dohvatiStatusKupovine } from '../api'
import type { UtakmicaBackend, Tim, ValutaBackend, Prvenstvo } from '../types'
import { useNavigate } from 'react-router-dom'
type Korak = 'podaci' | 'utakmice' | 'pregled' | 'obrada' | 'gotovo' | 'greska'

interface PodaciKupca {
  ime: string
  prezime: string
  adresa1: string
  postanskiBroj: string
  mesto: string
  drzava: string
  email: string
  potvrdaEmail: string
}

const praznaForma: PodaciKupca = {
  ime: '', prezime: '', adresa1: '', postanskiBroj: '', mesto: '', drzava: '', email: '', potvrdaEmail: '',
}

function KupovinaKarte() {
  const intervalRef = useRef<number | null>(null)
  const navigate = useNavigate()
  const [ucitavanje, setUcitavanje] = useState(true)//postavljanje pocetne vrednosti na true
  const [utakmice, setUtakmice] = useState<UtakmicaBackend[]>([])//postavljanje tipa podataka na UtakmiceBackedn i postavljanje poctene vrednosti [] 
  const [timovi, setTimovi] = useState<Tim[]>([]) //postavljanje pocetne vrendosti []
  const [valute, setValute] = useState<ValutaBackend[]>([]) //postavljanje pocetne vrensoti []
  const [prvenstvo, setPrvenstvo] = useState<Prvenstvo | null>(null)//prvenstvo je tipa Prvenstvo ilo null, i postavljamo na null pocetnu vrednost

  const [korak, setKorak] = useState<Korak>('podaci')
  const [podaci, setPodaci] = useState<PodaciKupca>(praznaForma)//Prikupljanje podataka o kupcu sa frome, podrayumevano forma sa praynim poljima
  const [odabraneUtakmice, setOdabraneUtakmice] = useState<number[]>([])//number, jer pamtimo id
  const [promoKod, setPromoKod] = useState('')
  const [promoKodPrimenjen, setPromoKodPrimenjen] = useState(false)//promoKodPrimenjen na false kao podrzumevano
  const [valutaId, setValutaId] = useState<number | null>(null)
  const [rezultat, setRezultat] = useState<{ sifra: string; noviPromoKod: string; ukupnaCena: string; valutaKod: string } | null>(null)
  const [porukaGreske, setPorukaGreske] = useState('')

  const [pretragaTima, setPretragaTima] = useState('')
  const [proveravaPromoKod, setProveravaPromoKod] = useState(false)
  const [greskaPromoKod, setGreskaPromoKod] = useState('')

  useEffect(() => {
    Promise.all([dohvatiUtakmiceAdmin(), dohvatiTimove(), dohvatiValute(), dohvatiPrvenstvo()])//pokretanje sva cetiri pziva istovremeno, i ceka da se sva zavrse
      .then(([u, t, v, p]) => {//u se odnosi na prvu funkciju, t na drugu i tako redom
        setUtakmice(u); setTimovi(t); setValute(v.filter((x) => x.aktivna));setPrvenstvo(p)//prikayuje samo valute koje su dozvoljene 
        if (v.length > 0) setValutaId(v.find((x) => x.aktivna)?.idValute ?? null)//ako je find pronasao nesto vrati idValute, u suprotnom null
      })
      .finally(() => setUcitavanje(false))//iyvrsava se uvek bey obyira da li je .then prosao uspseno ili ne
  }, [])

 useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])
  function nazivTima(id: number) {
    return timovi.find((t) => t.idTim === id)?.naziv ?? '—'
  }

  const filtriraneUtakmice = utakmice.filter((u) => {
    const tekst = pretragaTima.toLowerCase().trim()
    if (tekst === '') return true
    return nazivTima(u.tim1Id).toLowerCase().includes(tekst) || nazivTima(u.tim2Id).toLowerCase().includes(tekst)
  })

  function preokreniUtakmicu(id: number) {
    setOdabraneUtakmice((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const popustAktivan = !!(prvenstvo?.datumPopustaDo && new Date() <= new Date(prvenstvo.datumPopustaDo))

  const osnovnaCena = utakmice
    .filter((u) => odabraneUtakmice.includes(u.idUtakmica))
    .reduce((zbir, u) => zbir + Number(u.cenaKarte), 0)

  const cenaNakonRanogPopusta = popustAktivan ? osnovnaCena * 0.9 : osnovnaCena
  const cenaFinalna = promoKodPrimenjen ? cenaNakonRanogPopusta * 0.95 : cenaNakonRanogPopusta

  const izabranaValuta = valute.find((v) => v.idValute === valutaId)

  async function primeniPromoKod() {
  if (!promoKod.trim()) return
  setProveravaPromoKod(true)
  setGreskaPromoKod('')
  try {
    await proveriPromoKod(promoKod.trim())
    setPromoKodPrimenjen(true)
  } catch (e) {
    setGreskaPromoKod(e instanceof Error ? e.message : 'Promo kod nije validan.')
  } finally {
    setProveravaPromoKod(false)
  }
}

  async function potvrdiKupovinu() {
  if (!valutaId) return
  setKorak('obrada')

  const { idPoruke } = await kupiKartu({
    ime: podaci.ime,
    prezime: podaci.prezime,
    adresa1: podaci.adresa1,
    postanskiBroj: podaci.postanskiBroj,
    mesto: podaci.mesto,
    drzava: podaci.drzava,
    email: podaci.email,
    utakmiceId: odabraneUtakmice,
    idValute: valutaId,
    promoKodZaKoriscenje: promoKodPrimenjen ? promoKod : undefined,
  })

  intervalRef.current = window.setInterval(async () => {
    const stanje = await dohvatiStatusKupovine(idPoruke)
    if (stanje.status === 'gotovo') {
      clearInterval(intervalRef.current!)
      intervalRef.current = null
      setRezultat({
        sifra: stanje.sifra!,
        noviPromoKod: stanje.noviPromoKod!,
        ukupnaCena: stanje.ukupnaCena!,
        valutaKod: stanje.valutaKod!,
      })
      setKorak('gotovo')
    } else if (stanje.status === 'greska') {
      clearInterval(intervalRef.current!)
      intervalRef.current = null
      setPorukaGreske(stanje.poruka ?? 'Došlo je do greške.')
      setKorak('greska')
    }
  }, 1000)
}

function nazadNaPocetnu() {
if (intervalRef.current) clearInterval(intervalRef.current)
    navigate('/')
  }
  const formaValidna =
    podaci.ime && podaci.prezime && podaci.adresa1 && podaci.postanskiBroj &&
    podaci.mesto && podaci.drzava && podaci.email && podaci.email === podaci.potvrdaEmail

  if (ucitavanje) {
    return <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] flex items-center justify-center">Učitavanje...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-[#F4F1E9]">
      <h1 className="text-3xl font-black uppercase mb-2">Kupovina karata</h1>
      <p className="text-[#8B93A6] text-sm mb-10 font-mono">
        {korak === 'podaci' && 'Korak 1 / 3'}
        {korak === 'utakmice' && 'Korak 2 / 3'}
        {korak === 'pregled' && 'Korak 3 / 3'}
      </p>

      {korak === 'podaci' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="polje" placeholder="Ime" value={podaci.ime}
              onChange={(e) => setPodaci({ ...podaci, ime: e.target.value })} />
            <input className="polje" placeholder="Prezime" value={podaci.prezime}
              onChange={(e) => setPodaci({ ...podaci, prezime: e.target.value })} />
          </div>
          <input className="polje w-full" placeholder="Adresa" value={podaci.adresa1}
            onChange={(e) => setPodaci({ ...podaci, adresa1: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input className="polje" placeholder="Poštanski broj" value={podaci.postanskiBroj}
              onChange={(e) => setPodaci({ ...podaci, postanskiBroj: e.target.value })} />
            <input className="polje" placeholder="Mesto" value={podaci.mesto}
              onChange={(e) => setPodaci({ ...podaci, mesto: e.target.value })} />
          </div>
          <input className="polje w-full" placeholder="Država" value={podaci.drzava}
            onChange={(e) => setPodaci({ ...podaci, drzava: e.target.value })} />
          <input className="polje w-full" placeholder="Email" type="email" value={podaci.email}
            onChange={(e) => setPodaci({ ...podaci, email: e.target.value })} />
          <input className="polje w-full" placeholder="Potvrda email adrese" type="email" value={podaci.potvrdaEmail}
            onChange={(e) => setPodaci({ ...podaci, potvrdaEmail: e.target.value })} />
          {podaci.potvrdaEmail && podaci.email !== podaci.potvrdaEmail && (
            <p className="text-red-400 text-xs">Email adrese se ne poklapaju.</p>
          )}
          <button disabled={!formaValidna} onClick={() => setKorak('utakmice')}
            className="mt-4 bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed">
            Dalje
          </button>
        </div>
      )}

      {korak === 'utakmice' && (
        <div>
          <input className="polje w-full mb-6" placeholder="Pretraži po timu (npr. Srbija)"
            value={pretragaTima} onChange={(e) => setPretragaTima(e.target.value)} />

          <div className="space-y-3 mb-8">
            {filtriraneUtakmice.map((u) => {
              const izabrana = odabraneUtakmice.includes(u.idUtakmica)
              return (
                <button key={u.idUtakmica} onClick={() => preokreniUtakmicu(u.idUtakmica)}
                  className={`w-full text-left flex items-center justify-between px-5 py-4 rounded-sm border transition-colors
                    ${izabrana ? 'border-[#C9A227] bg-[#1A2332]' : 'border-white/10 bg-[#1A2332]/40 hover:border-white/30'}`}>
                  <div>
                    <p className="font-medium">{nazivTima(u.tim1Id)} — {nazivTima(u.tim2Id)}</p>
                    <p className="text-[#8B93A6] text-xs font-mono mt-1">{u.datum} · {u.vreme}</p>
                  </div>
                  <p className="font-mono text-[#C9A227]">{Number(u.cenaKarte).toFixed(2)} €</p>
                </button>
              )
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setKorak('podaci')} className="px-6 py-3 text-sm text-[#8B93A6] hover:text-[#F4F1E9]">
              Nazad
            </button>
            <button disabled={odabraneUtakmice.length === 0} onClick={() => setKorak('pregled')}
              className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed">
              Dalje ({odabraneUtakmice.length} izabrano)
            </button>
          </div>
        </div>
      )}

      {korak === 'pregled' && (
        <div className="space-y-6">
          <div className="bg-[#1A2332] border border-white/10 rounded-sm p-5 space-y-2">
            {utakmice.filter((u) => odabraneUtakmice.includes(u.idUtakmica)).map((u) => (
              <div key={u.idUtakmica} className="flex justify-between text-sm">
                <span>{nazivTima(u.tim1Id)} — {nazivTima(u.tim2Id)}</span>
                <span className="font-mono text-[#8B93A6]">{Number(u.cenaKarte).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-[#8B93A6] uppercase tracking-widest font-mono">Promo kod</label>
            <div className="flex gap-2 mt-1">
              <input className="polje flex-1" placeholder="Unesi kod ako imaš" value={promoKod}
                disabled={promoKodPrimenjen} onChange={(e) => setPromoKod(e.target.value)} />
              <button onClick={primeniPromoKod} disabled={promoKodPrimenjen || !promoKod || proveravaPromoKod}
  className="px-4 text-sm border border-white/20 rounded-sm hover:border-[#C9A227] disabled:opacity-30">
  {proveravaPromoKod ? 'Proveravam...' : 'Primeni'}
</button>
            </div>
            {promoKodPrimenjen && <p className="text-[#C9A227] text-xs mt-1">Kod je validan i biće primenjen.</p>}
            {greskaPromoKod && <p className="text-red-400 text-xs mt-1">{greskaPromoKod}</p>}
          </div>

          <div>
            <label className="text-xs text-[#8B93A6] uppercase tracking-widest font-mono">Valuta plaćanja</label>
            <select value={valutaId ?? ''} onChange={(e) => setValutaId(Number(e.target.value))} className="polje w-full mt-1">
              {valute.map((v) => <option key={v.idValute} value={v.idValute}>{v.naziv} ({v.kod})</option>)}
            </select>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-[#8B93A6]">
              <span>Osnovna cena</span><span className="font-mono">{osnovnaCena.toFixed(2)} €</span>
            </div>
            {popustAktivan && (
              <div className="flex justify-between text-[#8B93A6]">
                <span>Rani popust (10%)</span><span className="font-mono">-{(osnovnaCena * 0.1).toFixed(2)} €</span>
              </div>
            )}
            {promoKodPrimenjen && (
              <div className="flex justify-between text-[#8B93A6]">
                <span>Promo kod (5%, ako je validan)</span><span className="font-mono">-{(cenaNakonRanogPopusta * 0.05).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black pt-2">
              <span>Okvirno ukupno</span>
              <span className="font-mono text-[#C9A227]">{cenaFinalna.toFixed(2)} € (u {izabranaValuta?.kod})</span>
            </div>
            <p className="text-[#8B93A6] text-xs pt-1">Konačan iznos u izabranoj valuti obračunava se po trenutnom kursu prilikom obrade.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setKorak('utakmice')} className="px-6 py-3 text-sm text-[#8B93A6] hover:text-[#F4F1E9]">
              Nazad
            </button>
            <button onClick={potvrdiKupovinu}
              className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide">
              Potvrdi kupovinu
            </button>
          </div>
        </div>
      )}

      {korak === 'obrada' && (
        <div className="bg-[#1A2332] border border-white/10 rounded-sm p-8 text-center">
          <p className="text-[#8B93A6] text-sm">Obrada kupovine u toku...</p>
        </div>
      )}

      {korak === 'gotovo' && rezultat && (
        <div className="bg-[#1A2332] border border-[#C9A227]/40 rounded-sm p-8 text-center">
          <p className="text-[#C9A227] uppercase text-sm tracking-widest font-mono mb-4">Kupovina uspešna</p>
          <p className="text-sm text-[#8B93A6] mb-1">Šifra za kasniji pristup karti:</p>
          <p className="text-2xl font-mono mb-6">{rezultat.sifra}</p>
          <p className="text-sm text-[#8B93A6] mb-1">Tvoj promo kod za deljenje:</p>
          <p className="text-2xl font-mono text-[#C9A227]">{rezultat.noviPromoKod}</p>
          <p className="text-sm text-[#8B93A6] mb-1">Plaćeno:</p>
          <p className="text-2xl font-mono mb-6">{rezultat.ukupnaCena} {rezultat.valutaKod}</p>
          <button onClick={nazadNaPocetnu}
        className="px-6 py-3 text-sm text-[#8B93A6] hover:text-[#F4F1E9]">
        Nazad na početnu
      </button>
          
        </div>
      )}

      {korak === 'greska' && (
        <div className="bg-[#1A2332] border border-red-500/40 rounded-sm p-8 text-center">
          <p className="text-red-400 uppercase text-sm tracking-widest font-mono mb-2">Greška</p>
          <p className="text-sm text-[#8B93A6]">{porukaGreske}</p>
          <button onClick={nazadNaPocetnu}
        className="px-6 py-3 text-sm text-[#8B93A6] hover:text-[#F4F1E9]">
        Nazad na početnu
      </button>
          <button onClick={() => {if (intervalRef.current) clearInterval(intervalRef.current); setKorak('utakmice') }}
      className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide">
      Nazad na izbor utakmica
    </button>
        </div>
      )}
    </div>
  )
}

export default KupovinaKarte