// src/components/GaleriaFotos.jsx

import React from 'react';

// El componente ahora recibe la URL de la imagen como una prop
function GaleriaFotos({ imageUrl }) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
      {/* Imagen Principal */}
      <div className="col-span-1 row-span-2 bg-accent rounded-lg overflow-hidden">
        {/* Usamos la prop imageUrl para mostrar la imagen dinámicamente */}
        <img 
          src={imageUrl} 
          alt="Imagen principal de la cancha"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Miniaturas (placeholders) */}
      <div className="col-span-1 row-span-1 bg-accent rounded-lg flex items-center justify-center">
        <p className="text-primary">Thumb 1</p>
      </div>
      <div className="col-span-1 row-span-1 grid grid-cols-2 gap-2">
        <div className="bg-accent rounded-lg flex items-center justify-center">
          <p className="text-primary">Thumb 2</p>
        </div>
        <div className="bg-accent rounded-lg flex items-center justify-center">
          <p className="text-primary">Thumb 3</p>
        </div>
      </div>
    </div>
  );
}

export default GaleriaFotos;