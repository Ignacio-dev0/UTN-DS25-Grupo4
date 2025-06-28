import React, { useState } from 'react';
import './App.css';
import {canchaMock, reseñasMock, generarTurnosPorSemana} from './mockData'
import CanchaFotos from './components/CanchaFotos';
import Servicios from './components/Servicios';
import Ubicacion from './components/Ubicacion';
import TurnosDisponibles from './components/TurnosDisponibles';
import Reseñas from './components/Reseñas';
import logo from './assets/logo.png';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [reseñaActual, setReseñaActual] = useState(0);
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [nuevaReseña, setNuevaReseña] = useState('');

  const iniciarSesion = () => {
    window.location.href = '/login';
  };

  const reservar = () => {
    if (!usuario) {
      alert('Debe iniciar sesión para reservar un turno.');
      return;
    }
    alert('Turnos reservados: ' + turnosSeleccionados.join(', '));
  };

  const siguienteReseña = () => {
    if (reseñaActual < reseñasMock.length - 1) {
      setReseñaActual(reseñaActual + 1);
    }
  };

  const anteriorReseña = () => {
    if (reseñaActual > 0) {
      setReseñaActual(reseñaActual - 1);
    }

  const agregarReseña = () => {
  const texto = prompt("Escribí tu reseña:");
  if (texto && texto.trim().length > 0) {
    reseñasMock.push({ usuario: usuario.nombre, comentario: texto.trim() });
    setReseñaActual(reseñasMock.length - 1); // salta a la nueva reseña
  }
  };  
  };

  const turnosPorSemana = generarTurnosPorSemana();

  return (
    <div className="container">
      <header className="header">
        <a href="/" className="logo-link">
          <img src={logo} alt="Logo complejo" className="logo" />
        </a>
        <button className="login-button" onClick={iniciarSesion}>Iniciar Sesión</button>
      </header>

      <section className="complejo">
        <h2>{canchaMock.complejo}</h2>
        <CanchaFotos fotos={canchaMock.fotos} />
      </section>

      <section className="info">
        <Servicios descripcion={canchaMock.descripcion} />
        <Ubicacion ubicacion={canchaMock.ubicacion} />
      </section>

      <section className="turnos">
        <h3>Turnos Disponibles</h3>
        <TurnosDisponibles
        turnosPorSemana={turnosPorSemana}
        seleccionados={turnosSeleccionados}
        setSeleccionados={setTurnosSeleccionados}
        />
        <div className="confirmar-container">
          <button className="confirmar" onClick={reservar}>Confirmar</button>
        </div>
      </section>

      <section className="reseñas">
        <h3>Reseñas</h3>
        <Reseñas reseña={reseñasMock[reseñaActual]} />
        <div className="navegacion-reseñas">
          {reseñaActual > 0 && (
            <button onClick={anteriorReseña}>←</button>
          )}
          {reseñaActual < reseñasMock.length - 1 && (
            <button onClick={siguienteReseña}>→</button>
          )}
        </div>

          <div className="dejar-reseña-form">
            <textarea
              value={nuevaReseña}
              onChange={(e) => setNuevaReseña(e.target.value)}
              placeholder="Escribí tu reseña acá..."
              rows="4"
            />
            <button
              onClick={() => {
                if (!usuario) {
                  alert("Debes iniciar sesión para dejar una reseña.");
                  return;
                }
                if (nuevaReseña.trim() === '') {
                  alert("La reseña no puede estar vacía.");
                  return;
                }

                reseñasMock.push({ usuario: usuario.nombre, comentario: nuevaReseña.trim() });
                setReseñaActual(reseñasMock.length - 1);
                setNuevaReseña('');
              }}
              className={!usuario ? 'boton-desactivado' : ''}
            >
              Enviar reseña
            </button>
          </div>
      </section>

      <footer className="footer"></footer>
    </div>
  );
}

export default App;