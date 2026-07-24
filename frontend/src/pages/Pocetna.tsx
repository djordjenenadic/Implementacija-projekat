import { useEffect, useState } from 'react'
import Naslovnica from '../components/Naslovna'
import GrupaKartica from '../components/GrupnaKartica'
import { dohvatiPrvenstvo, dohvatiGrupe } from '../api'
import type { Prvenstvo, Grupa } from '../types'

function Pocetna() {
  const [prvenstvo, setPrvenstvo] = useState<Prvenstvo | null>(null)
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [ucitavanje, setUcitavanje] = useState(true)

  useEffect(() => {
    Promise.all([dohvatiPrvenstvo(), dohvatiGrupe()])
      .then(([p, g]) => {
        setPrvenstvo(p)
        setGrupe(g)
      })
      .finally(() => setUcitavanje(false))
  }, [])

  if (ucitavanje) {
    return <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] flex items-center justify-center">Učitavanje...</div>
  }

  if (!prvenstvo) {
    return <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] flex items-center justify-center">Greška pri učitavanju podataka.</div>
  }

  return (
    <>
      <Naslovnica prvenstvo={prvenstvo} />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-2xl uppercase tracking-wide font-black">
            Grupna faza
          </h2>
          <span className="text-[#8B93A6] text-xs uppercase tracking-widest font-mono">
            {grupe.length} grupe · {grupe.reduce((z, g) => z + g.timovi.length, 0)} timova
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {grupe.map((grupa) => (
            <GrupaKartica key={grupa.idGrupa} grupa={grupa} />
          ))}
        </div>
      </main>
    </>
  )
}

export default Pocetna