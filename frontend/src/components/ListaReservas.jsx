import React, { useState } from 'react';
import { StarIcon, TrashIcon, WalletIcon } from '@heroicons/react/24/solid';
import ModalConfirmacion from './ModalConfirmacion'; 

const getStatusClass = (estado) => {
  switch (estado) {
    case 'Finalizada': return 'bg-gray-200 text-gray-800';
    case 'Confirmada': return 'bg-secondary text-white';
    case 'Pendiente': return 'bg-canchaYellow text-white';
    case 'Cancelada': return 'bg-canchaRed text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function ListaReservas({ reservas, onCancelReserva, onDejarReseña }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState(null);

  const handleOpenCancelModal = (reserva) => {
    setReservaToCancel(reserva);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (reservaToCancel) {
      onCancelReserva(reservaToCancel.id);
    }
    setShowCancelModal(false);
    setReservaToCancel(null);
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Mis Reservas</h2>
      <div className="space-y-4">
        {reservas.length > 0 ? (
          reservas.map(reserva => (
            <div key={reserva.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-grow">
                <p className="font-semibold text-primary text-lg">{reserva.complejo} - {reserva.cancha}</p>
                <p className="text-sm text-secondary">Fecha: {reserva.fecha} a las {reserva.hora}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`font-bold text-xs px-3 py-1 rounded-full ${getStatusClass(reserva.estado)}`}>
                  {reserva.estado}
                </span>

                {reserva.estado === 'Finalizada' && !reserva.reseñada && (
                  <button 
                    onClick={() => onDejarReseña(reserva)} 
                    title="Dejar reseña" 
                    className="text-canchaYellow hover:text-canchaYellow p-2 rounded-full hover:bg-yellow-100 transition-colors"
                  >
                    <StarIcon className="w-6 h-6" />
                  </button>
                )}

                {(reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada') && (
                  <button 
                    onClick={() => handleOpenCancelModal(reserva)} 
                    title="Cancelar reserva" 
                    className="text-canchaRed hover:text-canchaRed p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                )}

                {reserva.estado === 'Pendiente' && (
                  <button title="Pagar reserva" className="text-secondary hover:text-primary p-2 rounded-full hover:bg-green-100 transition-colors">
                    <WalletIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Aún no tienes reservas.</p>
        )}
      </div>

      <ModalConfirmacion
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Confirmar Cancelación"
        message={`¿Estás seguro de que deseas cancelar tu reserva en ${reservaToCancel?.complejo} para el ${reservaToCancel?.fecha}?`}
        confirmText="Sí, Cancelar"
      />
    </div>
  );
}

export default ListaReservas;