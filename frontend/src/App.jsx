import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx'; 
import ReservaPage from './pages/ReservaPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MiComplejoPage from './pages/MiComplejoPage.jsx';
import EstadoSolicitudPage from './pages/EstadoSolicitudPage.jsx';
import ResultadosPage from './pages/ResultadosPage.jsx'; 
import MisReservasPage from './pages/MisReservasPage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import EditarCanchaPage from "./pages/EditarCanchaPage";
import RutaProtegida from './components/RutaProtegida.jsx';
import RutaProtegidaComplejo from './components/RutaProtegidaComplejo.jsx';
import ComplejoDetallePage from './pages/ComplejoDetallePage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
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
            <Route element={<RutaProtegida rolRequerido="normal" />}>
              <Route path="/mis-reservas" element={<MisReservasPage />} />
            </Route>
            <Route element={<RutaProtegidaComplejo />}>
              <Route path="/micomplejo/:complejoId" element={<MiComplejoPage />} />
              <Route path="/micomplejo/cancha/:canchaId/editar" element={<EditarCanchaPage />} />
            </Route>
            <Route element={<RutaProtegida rolRequerido="owner" />}>
              <Route path="/estado-solicitud" element={<EstadoSolicitudPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;