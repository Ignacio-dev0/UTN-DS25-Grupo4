import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import EditarCanchaPage from "./pages/EditarCanchaPage.jsx"; // Corregido: Faltaba .jsx
import RutaProtegida from './components/RutaProtegida.jsx';
import RutaProtegidaComplejo from './components/RutaProtegidaComplejo.jsx';
import ComplejoDetallePage from './pages/ComplejoDetallePage.jsx';

// --- IMPORTAR LA NUEVA PÁGINA DE CALLBACK ---
import MpCallbackPage from './components/MpConnectWallPage.jsx';

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

                        {/* --- Rutas de Dueño (MODIFICADAS) --- */}
                        <Route element={<RutaProtegida rolRequerido="owner" />}>
                            <Route path="/estado-solicitud" element={<EstadoSolicitudPage />} />
                            
                            {/* --- RUTAS NUEVAS PARA MP CONNECT --- */}
                            <Route
                                path="/dashboard/dueño/mp-callback"
                                element={<MpCallbackPage />}
                            />
                            {/* Esta ruta es un atajo para redirigir al dueño después del callback */}
                            <Route
                                path="/dashboard-dueño"
                                element={<Navigate to="/estado-solicitud" replace />}
                            />
                            {/* --- FIN RUTAS NUEVAS --- */}

                        </Route>
                        
                        {/* Ruta de fallback (buena práctica) */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;