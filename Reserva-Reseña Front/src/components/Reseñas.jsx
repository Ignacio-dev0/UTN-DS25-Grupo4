import React from 'react';

function Reseñas({ reseña }) {
  return (
    <div className="reseña-card">
      <h4>{reseña.usuario}</h4>
      <p>{reseña.comentario}</p>
    </div>
  );
}

export default Reseñas;