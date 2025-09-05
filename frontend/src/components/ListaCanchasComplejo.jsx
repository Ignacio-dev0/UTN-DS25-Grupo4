import React, { useState } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';
import FormularioNuevaCancha from './FormularioNuevaCancha.jsx';
import ModalConfirmacion from './ModalConfirmacion.jsx'; 
import { FaTrash, FaEyeSlash, FaEye, FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ListaCanchasComplejo({ canchas, onDisable, onDelete, isEditing }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [accion, setAccion] = useState(''); 
  const CANCHAS_POR_PAGINA = 5;
  const canchasPaginadas = canchas.slice(0, CANCHAS_POR_PAGINA);

  const handleGuardarCancha = (nuevaCancha) => {
    console.log('Guardando nueva cancha:', nuevaCancha);
    setShowAddForm(false);
  };
  

  const handleActionClick = (cancha, tipoAccion) => {
    setCanchaSeleccionada(cancha);
    setAccion(tipoAccion);
    setIsModalOpen(true);
  };


  const handleConfirmAction = () => {
    if (!canchaSeleccionada) return;

    if (accion === 'eliminar') {
      onDelete(canchaSeleccionada.id);
    } else if (accion === 'deshabilitar') {
      onDisable(canchaSeleccionada.id);
    }

    setIsModalOpen(false);
    setCanchaSeleccionada(null);
    setAccion('');
  };


  let modalTitle = '';
  let modalMessage = '';
  let confirmText = '';

  if (canchaSeleccionada) {
    if (accion === 'eliminar') {
      modalTitle = 'Confirmar Eliminación';
      modalMessage = `¿Estás seguro de que deseas eliminar la cancha "${canchaSeleccionada.deporte} - N°${canchaSeleccionada.noCancha}"? Esta acción no se puede deshacer.`;
      confirmText = 'Sí, Eliminar';
    } else {
      const esHabilitada = canchaSeleccionada.estado === 'habilitada';
      modalTitle = esHabilitada ? 'Confirmar Deshabilitación' : 'Confirmar Habilitación';
      modalMessage = `¿Estás seguro de que deseas ${esHabilitada ? 'deshabilitar' : 'habilitar'} la cancha "${canchaSeleccionada.deporte} - N°${canchaSeleccionada.noCancha}"?`;
      confirmText = esHabilitada ? 'Sí, Deshabilitar' : 'Sí, Habilitar';
    }
  }

  return (
    <div className="w-full md:w-2/3 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Canchas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canchasPaginadas.map(cancha => (
          <div key={cancha.id} className="relative group">
            <MiniCanchaCard 
              cancha={cancha}
            />
            {isEditing && (
              <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleActionClick(cancha, 'deshabilitar')} 
                  className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600" 
                  title={cancha.estado === 'deshabilitada' ? 'Habilitar' : 'Deshabilitar'}
                >
                  {cancha.estado === 'deshabilitada' ? <FaEye /> : <FaEyeSlash />}
                </button>
                <button 
                  onClick={() => handleActionClick(cancha, 'eliminar')} 
                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600" 
                  title="Eliminar Cancha"
                >
                  <FaTrash />
                </button>
                <Link to={`/micomplejo/cancha/${cancha.id}/editar`}>
                  <button className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600" title="Editar Cancha">
                    <FaPencilAlt />
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowAddForm(true)}
          className="border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-accent hover:bg-accent hover:border-primary hover:text-primary transition-all duration-300 min-h-[220px] aspect-w-1 aspect-h-1"
        >
          <PlusIcon className="w-12 h-12" />
          <span className="mt-2 font-semibold">Agregar Cancha</span>
        </button>
      </div>

      {showAddForm && (
        <FormularioNuevaCancha
          onCerrar={() => setShowAddForm(false)}
          onGuardar={handleGuardarCancha}
        />
      )}

      {isModalOpen && (
        <ModalConfirmacion
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={modalTitle}
          message={modalMessage}
          confirmText={confirmText}
        />
      )}
    </div>
  );
}

export default ListaCanchasComplejo;