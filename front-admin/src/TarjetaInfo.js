import React from 'react';
import './TarjetaInfo.css';

function TarjetaInfo({ titulo, descripcion, colorFondo }) {
  return (
    <div className="tarjeta" style={{ backgroundColor: colorFondo || '#f0f0f0' }}>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
    </div>
  );
}

export default TarjetaInfo;
