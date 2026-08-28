import type { Prvenstvo } from '../types'
import { useNavigate } from 'react-router-dom'
interface NaslovnaProps {
  prvenstvo: Prvenstvo
}

function Naslovna({ prvenstvo }: NaslovnaProps) {
  const navigate = useNavigate()
  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#C9A227]/20 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-20">
        <p className="text-[#C9A227] text-sm tracking-[0.3em] uppercase mb-4 font-mono">
          {prvenstvo.datumPocetka} — {prvenstvo.datumZavrsetka} · {prvenstvo.lokacija}
        </p>
        <h1 className="text-5xl md:text-7xl leading-[0.95] uppercase mb-6 font-black tracking-tight">
          Svetsko<br />
          Prvenstvo<br />
          <span className="text-[#C9A227]">u Košarci</span>
        </h1>
        <p className="text-[#8B93A6] text-lg max-w-xl leading-relaxed">
          {prvenstvo.opis}
        </p>

        <button onClick={() => navigate('/kupovina')} className="mt-8 bg-[#C9A227] text-[#0B1120] font-semibold px-7 py-3 rounded-sm
                     hover:bg-[#dbb52f] transition-colors uppercase text-sm tracking-wide">
          Kupi kartu
        </button>
      </div>
    </header>
  )
}

export default Naslovna