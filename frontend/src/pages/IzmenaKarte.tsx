import { useState } from 'react'
import { dohvatiUtakmiceAdmin, dohvatiTimove, pronadjiKartu, izmeniKartu, dohvatiPrvenstvo } from '../api'
import type { UtakmicaBackend, Tim, KartaBackend,Prvenstvo } from '../types'

function IzmenaKarte() {
  const [sifra, setSifra] = useState('')
  const [email, setEmail] = useState('')
  const [greska, setGreska] = useState('')
  const [karta, setKarta] = useState<KartaBackend | null>(null)
  const [odabraneUtakmice, setOdabraneUtakmice] = useState<number[]>([])
  const [sacuvano, setSacuvano] = useState(false)

  const [utakmice, setUtakmice] = useState<UtakmicaBackend[]>([])
  const [timovi, setTimovi] = useState<Tim[]>([])
  const [prvenstvo, setPrvenstvo] = useState<Prvenstvo | null>(null)
  function nazivTima(id: number) {
    return timovi.find((t) => t.idTim === id)?.naziv ?? '—'
  }

  async function pretraziKartu() {
  setGreska('')
  try {
    const [pronadjena, sveUtakmice, sviTimovi, prvenstvoPodaci] = await Promise.all([
      pronadjiKartu(sifra, email),
      dohvatiUtakmiceAdmin(),
      dohvatiTimove(),
      dohvatiPrvenstvo(),
    ])
    setKarta(pronadjena)
    setUtakmice(sveUtakmice)
    setTimovi(sviTimovi)
    setPrvenstvo(prvenstvoPodaci)
    setOdabraneUtakmice(pronadjena.stavke.map((s) => s.idUtakmice))
  } catch (e) {
    setGreska(e instanceof Error ? e.message : 'Greška pri pretrazi.')
  }
}

  function preokreniUtakmicu(id: number) {
    setSacuvano(false)
    setOdabraneUtakmice((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function sacuvajIzmene() {
    if (!karta) return
    setGreska('')
    try {
      const azurirana = await izmeniKartu(sifra, email, odabraneUtakmice)
      setKarta({ ...azurirana, stavke: odabraneUtakmice.map((id) => ({ idKarte: karta.idKarta, idUtakmice: id, cena: '', popustPrimenjen: false })) })
      setSacuvano(true)
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška pri čuvanju.')
    }
  }

  /*const pocetneUtakmiceId = karta?.stavke.map((s) => s.idUtakmice) ?? []
 const osnovnaCena = utakmice
    .filter((u) => odabraneUtakmice.includes(u.idUtakmica))
    .reduce((zbir, u) => zbir + Number(u.cenaKarte), 0)*/
    const pocetneUtakmiceId = karta?.stavke.map((s) => s.idUtakmice) ?? []

const dodateUtakmice = utakmice.filter((u) =>
  odabraneUtakmice.includes(u.idUtakmica) && !pocetneUtakmiceId.includes(u.idUtakmica)
)
const uklonjeneUtakmice = utakmice.filter((u) =>
  pocetneUtakmiceId.includes(u.idUtakmica) && !odabraneUtakmice.includes(u.idUtakmica)
)

const popustAktivan = !!(prvenstvo?.datumPopustaDo && new Date() <= new Date(prvenstvo.datumPopustaDo))

const osnovnaCenaDodatih = dodateUtakmice.reduce((zbir, u) => zbir + Number(u.cenaKarte), 0)
const cenaDodatihNakonPopusta = popustAktivan ? osnovnaCenaDodatih * 0.9 : osnovnaCenaDodatih

const osnovnaCenaUklonjenih = uklonjeneUtakmice.reduce((zbir, u) => zbir + Number(u.cenaKarte), 0)
const cenaUklonjenihNakonPopusta = popustAktivan ? osnovnaCenaUklonjenih * 0.9 : osnovnaCenaUklonjenih

const imaIzmena = dodateUtakmice.length > 0 || uklonjeneUtakmice.length > 0
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-[#F4F1E9]">
      <h1 className="text-3xl font-black uppercase mb-2">Izmena karte</h1>
      <p className="text-[#8B93A6] text-sm mb-10">
        Unesi šifru i email koje si dobio prilikom kupovine.
      </p>

      {!karta && (
        <div className="space-y-4">
          <input className="polje w-full" placeholder="Šifra" value={sifra} onChange={(e) => setSifra(e.target.value)} />
          <input className="polje w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {greska && <p className="text-red-400 text-xs">{greska}</p>}
          <button onClick={pretraziKartu}
            className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide">
            Pronađi kartu
          </button>
        </div>
      )}

      {karta && (
        <div>
          <div className="space-y-3 mb-8">
            {utakmice.map((u) => {
              const izabrana = odabraneUtakmice.includes(u.idUtakmica)
              const bilaOdPocetka = pocetneUtakmiceId.includes(u.idUtakmica)
              return (
                <button key={u.idUtakmica} onClick={() => preokreniUtakmicu(u.idUtakmica)}
                  className={`w-full text-left flex items-center justify-between px-5 py-4 rounded-sm border transition-colors
                    ${izabrana ? 'border-[#C9A227] bg-[#1A2332]' : 'border-white/10 bg-[#1A2332]/40 hover:border-white/30'}`}>
                  <div>
                    <p className="font-medium">{nazivTima(u.tim1Id)} — {nazivTima(u.tim2Id)}</p>
                    <p className="text-[#8B93A6] text-xs font-mono mt-1">
                      {u.datum}
                      {bilaOdPocetka && !izabrana && ' · biće uklonjena'}
                      {!bilaOdPocetka && izabrana && ' · biće dodata'}
                    </p>
                  </div>
                  <p className="font-mono text-[#C9A227]">{Number(u.cenaKarte).toFixed(2)} €</p>
                </button>
              )
            })}
          </div>
{imaIzmena ? (
  <div className="border-t border-white/10 pt-4 mb-4 space-y-2 text-sm">
    {dodateUtakmice.length > 0 && (
      <>
        <div className="flex justify-between text-[#8B93A6]">
          <span>Cena dodatih utakmica ({dodateUtakmice.length})</span>
          <span className="font-mono">{osnovnaCenaDodatih.toFixed(2)} €</span>
        </div>
        {popustAktivan && (
          <div className="flex justify-between text-[#8B93A6]">
            <span>Rani popust (10%)</span>
            <span className="font-mono">-{(osnovnaCenaDodatih * 0.1).toFixed(2)} €</span>
          </div>
        )}
        <div className="flex justify-between font-black">
          <span>Dodatno zaduženje</span>
          <span className="font-mono text-[#C9A227]">+{cenaDodatihNakonPopusta.toFixed(2)} €</span>
        </div>
      </>
    )}
    {uklonjeneUtakmice.length > 0 && (
      <div className="flex justify-between font-black pt-2">
        <span>Umanjenje zaduženja ({uklonjeneUtakmice.length} uklonjeno)</span>
        <span className="font-mono text-[#C9A227]">-{cenaUklonjenihNakonPopusta.toFixed(2)} €</span>
      </div>
    )}
    <p className="text-xs text-[#8B93A6] pt-1">Iznosi su izraženi po kursu iz trenutka prve kupovine.</p>
  </div>
) : (
  <p className="text-[#8B93A6] text-sm border-t border-white/10 pt-4 mb-4">Nema izmena u sastavu karte.</p>
)}
          {greska && <p className="text-red-400 text-xs mb-4">{greska}</p>}

          <button onClick={sacuvajIzmene} disabled={odabraneUtakmice.length === 0 || !imaIzmena}
            className="bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed">
            Sačuvaj izmene
          </button>

          {sacuvano && <p className="text-[#C9A227] text-sm mt-4">Izmene su sačuvane.</p>}
        </div>
      )}
    </div>
  )
}

export default IzmenaKarte