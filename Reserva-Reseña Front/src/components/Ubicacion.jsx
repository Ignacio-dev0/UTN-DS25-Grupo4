import React from 'react';

function Ubicacion({ ubicacion }) {
  return (
    <div className="ubicacion">
      <h3>Ubicación</h3>
      <img src={ubicacion} alt="Ubicación de la cancha" />
    </div>
  );
}

export default Ubicacion;