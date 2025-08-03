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

function App() {
  return (
    <BrowserRouter>
      
        <Routes>
          <Route path="/login" element={<LogInPage />} />
          <Route path="/registro" element={<SignUpPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reserva/:canchaId" element={<ReservaPage />} />
            <Route path="/admin" element={<AdminPage />} /> {/* Habria que Verificar esta Ruta */}
            <Route path="/micomplejo/:complejoId" element={<MiComplejoPage />} /> {/* Habria que Verificar esta Ruta */}
            <Route path="/resultados" element={<ResultadosPage />} />
            <Route path="/mis-reservas" element={<MisReservasPage />} /> {/* Habria que Verificar esta Ruta */}
          </Route>
        </Routes>
      
   

    </BrowserRouter>
  );
}

export default App;