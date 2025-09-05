import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx'; 
import ReservaPage from './pages/ReservaPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MiComplejoPage from './pages/MiComplejoPage.jsx';
import ResultadosPage from './pages/ResultadosPage.jsx'; 
import MisReservasPage from './pages/MisReservasPage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import EditarCanchaPage from "./pages/EditarCanchaPage";
import RutaProtegida from './components/RutaProtegida.jsx';
import ComplejoDetallePage from './pages/ComplejoDetallePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* --- Rutas Públicas --- */}
          <Route path="/login" element={<LogInPage />} />
          <Route path="/registro" element={<SignUpPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/reserva/:canchaId" element={<ReservaPage />} />
          <Route path="/resultados" element={<ResultadosPage />} />
          <Route path="/complejo/:complejoId" element={<ComplejoDetallePage />} /> 
          
          {/* --- Rutas Protegidas --- */}
          <Route element={<RutaProtegida rolRequerido="admin" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/micomplejo/:complejoId" element={<MiComplejoPage />} />
          <Route path="/micomplejo/cancha/:canchaId/editar" element={<EditarCanchaPage />} />
          <Route path="/mis-reservas" element={<MisReservasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;