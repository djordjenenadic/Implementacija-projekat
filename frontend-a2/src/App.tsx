import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { dohvatiStatistikuPoUtakmici, dohvatiStatistikuPoDanima } from './api'
import type { StatistikaUtakmice, StatistikaDana } from './types'

type Tab = 'utakmice' | 'dani'

function App() {
  const [tab, setTab] = useState<Tab>('utakmice')
  const [ucitavanje, setUcitavanje] = useState(true)

  const [poUtakmici, setPoUtakmici] = useState<StatistikaUtakmice[]>([])
  const [poDanima, setPoDanima] = useState<StatistikaDana[]>([])
  const [odDatuma, setOdDatuma] = useState('')

  async function ucitajSve() {
    setUcitavanje(true)
    const [u, d] = await Promise.all([
      dohvatiStatistikuPoUtakmici(),
      dohvatiStatistikuPoDanima(odDatuma || undefined),
    ])
    setPoUtakmici(u)
    setPoDanima(d)
    setUcitavanje(false)
  }

  useEffect(() => {
    ucitajSve()
    const interval = setInterval(ucitajSve, 10000) // osvežava svakih 10s, "u realnom vremenu"
    return () => clearInterval(interval)
  }, [odDatuma])

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] font-sans">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-[#C9A227] text-xs tracking-[0.3em] uppercase mb-2 font-mono">
            Portal za izveštavanje
          </p>
          <h1 className="text-3xl font-black uppercase">Statistika kupovine karata</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex gap-1 border-b border-white/10 mb-8">
          <button onClick={() => setTab('utakmice')}
            className={`px-4 py-3 text-sm border-b-2 transition-colors
              ${tab === 'utakmice' ? 'border-[#C9A227] text-[#F4F1E9]' : 'border-transparent text-[#8B93A6] hover:text-[#F4F1E9]'}`}>
            Po utakmici
          </button>
          <button onClick={() => setTab('dani')}
            className={`px-4 py-3 text-sm border-b-2 transition-colors
              ${tab === 'dani' ? 'border-[#C9A227] text-[#F4F1E9]' : 'border-transparent text-[#8B93A6] hover:text-[#F4F1E9]'}`}>
            Po danima
          </button>
        </div>

        {ucitavanje && <p className="text-[#8B93A6] text-sm">Učitavanje...</p>}

        {!ucitavanje && tab === 'utakmice' && (
          <div className="space-y-8">
            <div className="bg-[#1A2332] border border-white/10 rounded-sm p-5" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poUtakmici}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#8B93A6" strokeOpacity={0.15} />
                  <XAxis dataKey="naziv" tick={{ fill: '#8B93A6', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8B93A6', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#F4F1E9' }} />
                  <Bar dataKey="brojKarata" fill="#C9A227" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[#8B93A6] font-mono text-xs uppercase tracking-widest">
                  <th className="py-2">Utakmica</th>
                  <th className="py-2">Datum</th>
                  <th className="py-2 text-right">Broj karata</th>
                </tr>
              </thead>
              <tbody>
                {poUtakmici.map((u) => (
                  <tr key={u.idUtakmice} className="border-b border-white/5">
                    <td className="py-3">{u.naziv}</td>
                    <td className="py-3 text-[#8B93A6] font-mono">{u.datumOdigravanja}</td>
                    <td className="py-3 text-right font-mono text-[#C9A227]">{u.brojKarata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!ucitavanje && tab === 'dani' && (
          <div className="space-y-8">
            <div>
              <label className="text-xs text-[#8B93A6] uppercase tracking-widest font-mono">
                Prikaži od datuma
              </label>
              <input type="date" className="polje mt-1" value={odDatuma}
                onChange={(e) => setOdDatuma(e.target.value)} />
            </div>

            <div className="bg-[#1A2332] border border-white/10 rounded-sm p-5" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={poDanima}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#8B93A6" strokeOpacity={0.15} />
                  <XAxis dataKey="dan" tick={{ fill: '#8B93A6', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8B93A6', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#F4F1E9' }} />
                  <Line type="monotone" dataKey="brojKarata" stroke="#C9A227" strokeWidth={2} dot={{ fill: '#C9A227' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[#8B93A6] font-mono text-xs uppercase tracking-widest">
                  <th className="py-2">Datum</th>
                  <th className="py-2 text-right">Broj kupljenih karata</th>
                </tr>
              </thead>
              <tbody>
                {poDanima.map((d) => (
                  <tr key={d.dan} className="border-b border-white/5">
                    <td className="py-3 font-mono">{d.dan}</td>
                    <td className="py-3 text-right font-mono text-[#C9A227]">{d.brojKarata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default App