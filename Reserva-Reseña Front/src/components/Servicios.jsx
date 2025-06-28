import React from 'react';

function Servicios({ descripcion }) {
  return (
    <div className="servicios">
      <h3>Servicios</h3>
      <p>{descripcion}</p>
    </div>
  );
}

export default Servicios;