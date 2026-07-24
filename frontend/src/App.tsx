import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigacija from './components/Navigacija'
import Pocetna from './pages/Pocetna'
import KupovinaKarte from './pages/KupovinaKarte'
import IzmenaKarte from './pages/IzmenaKarte'
import OtkazivanjeKarte from './pages/OtkazivanjeKarte'
import Administracija from './pages/Administracija'
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1120] text-[#F4F1E9] font-sans">
        <Navigacija />
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route path="/kupovina" element={<KupovinaKarte />} />
          <Route path="/izmena" element={<IzmenaKarte />} />
          <Route path="/otkazivanje" element={<OtkazivanjeKarte />} />
          <Route path="/admin" element={<Administracija />} />
          {/* ostale rute dodajemo u sledećim koracima */}
        </Routes>
        <footer className="border-t border-white/10 py-8 text-center text-[#8B93A6] text-xs">
          Svetsko prvenstvo u košarci · Katar 2027
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App