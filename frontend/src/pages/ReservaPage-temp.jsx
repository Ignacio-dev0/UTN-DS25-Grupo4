import React from 'react';
import { useParams } from 'react-router-dom';

function ReservaPage() {
  const { canchaId } = useParams();
  
  return (
    <div style={{padding: '20px'}}>
      <h1 style={{color: 'blue', fontSize: '24px'}}>
        Página de Reserva - Cancha ID: {canchaId}
      </h1>
      <p>Esta es una página temporal para verificar que el routing funciona.</p>
    </div>
  );
}

export default ReservaPage;
