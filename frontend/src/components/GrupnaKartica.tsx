import type { Grupa } from '../types'

interface GrupaKarticaProps {
  grupa: Grupa
}

function GrupaKartica({ grupa }: GrupaKarticaProps) {
  return (
    <div className="bg-[#1A2332] border border-white/5 rounded-sm overflow-hidden
                     hover:border-[#C9A227]/40 transition-colors">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9A227]/30">
        <span className="text-[#C9A227] text-xs tracking-[0.2em] uppercase font-mono">
          Grupa {grupa.naziv}
        </span>
        <span className="text-[#8B93A6] text-xs font-mono">
          {String(grupa.timovi.length).padStart(2, '0')} tima
        </span>
      </div>
      <ul>
        {grupa.timovi.map((tim, i) => (
          <li
            key={tim.idTim}
            className={`flex items-center gap-3 px-5 py-3 text-sm
              ${i !== grupa.timovi.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-[#8B93A6] w-4 font-mono">{i + 1}</span>
            {tim.naziv}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GrupaKartica