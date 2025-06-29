import React from 'react';
import './CanchaFotos.css';

function CanchaFotos({ fotos }) {
  return (
    <div className="cancha-fotos">
      {fotos.map((foto, index) => (
        <img key={index} src={foto} alt={`Foto ${index + 1}`} />
      ))}
    </div>
  );
}

export default CanchaFotos;