import React, { useState } from 'react';
import { FaCreditCard, FaUniversity, FaRegCreditCard, FaCheckCircle, FaSpinner } from 'react-icons/fa';

function ModalPago({ isOpen, onClose, onConfirmarPago, turno }) {
  const [metodo, setMetodo] = useState('CREDITO');
  const [estado, setEstado] = useState('inicial'); 

  if (!isOpen) return null;

  const handlePago = () => {
    setEstado('procesando');
    setTimeout(() => {
      setEstado('exitoso');
      setTimeout(() => {
        onConfirmarPago({ metodoPago: metodo, monto: turno.precio });
        onClose();
        setEstado('inicial');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        
        {estado === 'inicial' && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-primary">Confirmar y Pagar</h2>
            <p className="text-lg text-secondary mb-6">
              Estás por reservar para el <strong>{turno.dia} a las {turno.hora} hs</strong>
            </p>
            <div className="bg-accent p-4 rounded-lg mb-6 text-center">
              <p className="text-primary">Total a pagar</p>
              <p className="text-4xl font-bold text-primary">${turno.precio.toLocaleString('es-AR')}</p>
            </div>
            
            <h3 className="font-semibold text-gray-700 mb-3">Seleccioná tu método de pago:</h3>
            <div className="space-y-3">
              <button onClick={() => setMetodo('CREDITO')} className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg ${metodo === 'CREDITO' ? 'border-primary bg-accent' : 'border-gray-300'}`}>
                <FaCreditCard className="text-primary"/> <span className="font-semibold">Tarjeta de Crédito</span>
              </button>
              <button onClick={() => setMetodo('DEBITO')} className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg ${metodo === 'DEBITO' ? 'border-primary bg-accent' : 'border-gray-300'}`}>
                <FaRegCreditCard className="text-primary"/> <span className="font-semibold">Tarjeta de Débito</span>
              </button>
              <button onClick={() => setMetodo('TRANSFERENCIA')} className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg ${metodo === 'TRANSFERENCIA' ? 'border-primary bg-accent' : 'border-gray-300'}`}>
                <FaUniversity className="text-primary"/> <span className="font-semibold">Transferencia Bancaria</span>
              </button>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handlePago} className="bg-secondary text-light font-bold py-2 px-6 rounded-lg hover:bg-primary">Pagar</button>
            </div>
          </>
        )}

        {estado === 'procesando' && (
          <div className="text-center p-8">
            <FaSpinner className="animate-spin text-primary mx-auto h-16 w-16" />
            <p className="mt-4 font-semibold text-secondary">Procesando pago...</p>
          </div>
        )}

        {estado === 'exitoso' && (
          <div className="text-center p-8">
            <FaCheckCircle className="text-green-500 mx-auto h-16 w-16" />
            <p className="mt-4 font-bold text-2xl text-primary">¡Pago Exitoso!</p>
            <p className="text-secondary">Tu reserva fue confirmada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalPago;