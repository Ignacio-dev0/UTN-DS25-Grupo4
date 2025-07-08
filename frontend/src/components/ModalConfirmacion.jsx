import React from 'react';
import { ExclamationTriangleIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/outline';

function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Atras"
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50 p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-canchaRed" />
        <h2 className="text-2xl font-bold mt-4 mb-2 text-primary">{title}</h2>
        <p className="text-lg text-secondary mb-8">
          {message}
        </p>

        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-36 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeftCircleIcon className="w-6 h-6" />
            <span>{cancelText}</span>
          </button>
          <button 
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 w-36 bg-canchaRed text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;