import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage'; 
import ReservaPage from './pages/ReservaPage';
import AdminPage from './pages/AdminPage';
import MiComplejoPage from './pages/MiComplejoPage';
import EstadoSolicitudPage from './pages/EstadoSolicitudPage';
import ResultadosPage from './pages/ResultadosPage'; 
import MisReservasPage from './pages/MisReservasPage';
import LogInPage from './pages/LogInPage';
import SignUpPage from './pages/SignUpPage';
import EditarCanchaPage from "./pages/EditarCanchaPage.jsx"; // Corregido: agregada extensión .jsx
import RutaProtegida from './components/RutaProtegida';
import RutaProtegidaComplejo from './components/RutaProtegidaComplejo';
import ComplejoDetallePage from './pages/ComplejoDetallePage';

// 1. Importar la nueva página de callback
import MpCallbackPage from './components/MpCallbackPage.jsx'; // Asumo que está en /pages

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
                        
                        {/* --- RUTA DE CALLBACK DE MP (Ahora es pública y usa la URL simple) --- */}
                        <Route 
                            path="/mp-callback" 
                            element={<MpCallbackPage />} 
                        />

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
                            
                            {/* Esta ruta redirige al usuario a su estado de solicitud (ruta principal de dueño) */}
                            <Route 
                                path="/dashboard-dueño" 
                                element={<Navigate to="/estado-solicitud" replace />} 
                            />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;