import { Link } from 'react-router-dom'

function Navigacija() {
  const linkovi = [
    { put: '/', naziv: 'Početna' },
    { put: '/kupovina', naziv: 'Kupi kartu' },
    { put: '/izmena', naziv: 'Izmeni kartu' },
    { put: '/otkazivanje', naziv: 'Otkaži kartu' },
    { put: '/admin', naziv: 'Administracija' },
  ]

  return (
    <nav className="border-b border-white/10 bg-[#0B1120]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        {linkovi.map((l) => (
          <Link
            key={l.put}
            to={l.put}
            className="text-sm text-[#8B93A6] hover:text-[#F4F1E9] transition-colors"
          >
            {l.naziv}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navigacija