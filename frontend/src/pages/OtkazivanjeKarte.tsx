import { useState } from 'react'
import { pronadjiKartu, otkaziKartu } from '../api'
import type { KartaBackend } from '../types'

function OtkazivanjeKarte() {
  const [sifra, setSifra] = useState('')
  const [email, setEmail] = useState('')
  const [greska, setGreska] = useState('')
  const [karta, setKarta] = useState<KartaBackend | null>(null)
  const [otkazana, setOtkazana] = useState(false)

  async function pretraziKartu() {
    setGreska('')
    try {
      const pronadjena = await pronadjiKartu(sifra, email)
      setKarta(pronadjena)
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška pri pretrazi.')
    }
  }

  async function potvrdiOtkazivanje() {
    setGreska('')
    try {
      await otkaziKartu(sifra, email)
      setOtkazana(true)
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška pri otkazivanju.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-[#F4F1E9]">
      <h1 className="text-3xl font-black uppercase mb-2">Otkazivanje karte</h1>
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

      {karta && !otkazana && (
        <div>
          <div className="bg-[#1A2332] border border-white/10 rounded-sm p-5 mb-6">
            <p className="text-sm">Šifra: <span className="font-mono">{karta.sifra}</span></p>
            <p className="text-sm text-[#8B93A6]">Ukupno plaćeno: {karta.ukupnaCena}</p>
          </div>

          <div className="border border-red-500/30 bg-red-500/5 rounded-sm p-5 mb-6">
            <p className="text-sm text-[#F4F1E9]">
              Otkazana karta se ne može ponovo aktivirati, ali ostaje u istoriji.
              Ako je karta koristila ili generisala promo kod, on postaje nevažeći.
            </p>
          </div>

          {greska && <p className="text-red-400 text-xs mb-4">{greska}</p>}

          <button onClick={potvrdiOtkazivanje}
            className="bg-red-500/90 text-[#0B1120] font-semibold px-7 py-3 rounded-sm hover:bg-red-500 transition-colors uppercase text-sm tracking-wide">
            Otkaži kartu
          </button>
        </div>
      )}

      {otkazana && (
        <div className="bg-[#1A2332] border border-red-500/30 rounded-sm p-8 text-center">
          <p className="text-red-400 uppercase text-sm tracking-widest font-mono mb-2">Karta otkazana</p>
          <p className="text-[#8B93A6] text-sm">Karta {sifra} je otkazana i ostaje zabeležena u istoriji.</p>
        </div>
      )}
    </div>
  )
}

export default OtkazivanjeKarte