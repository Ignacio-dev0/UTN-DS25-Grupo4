import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ModalConfirmacion from './ModalConfirmacion';
import { TrashIcon } from '@heroicons/react/24/solid';
import { FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';

// Función para obtener clases CSS del badge de estado
const getStatusClass = (estado) => {
  switch (estado) {
    case 'APROBADO': return 'bg-secondary text-white';
    case 'PENDIENTE': return 'bg-canchaYellow text-white';
    case 'RECHAZADO': return 'bg-canchaRed text-white';
    case 'OCULTO': return 'bg-gray-400 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function ComplejosAprobadosLista({ complejos, onRemove, onToggleVisibility }) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [complejoToRemove, setComplejoToRemove] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const handleOpenRemoveModal = (complejo) => {
    setComplejoToRemove(complejo);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (complejoToRemove) {
      onRemove(complejoToRemove.id);
    }
    setShowRemoveModal(false);
    setComplejoToRemove(null);
  };

  // Debug para ver qué recibimos
  console.log('Complejos en componente:', complejos);

  // Filtrar complejos según el estado seleccionado
  const complejosFiltrados = useMemo(() => {
    if (filtroEstado === 'Todos') {
      return complejos;
    }
    return complejos.filter(c => c.estado === filtroEstado);
  }, [complejos, filtroEstado]);

  // Contar complejos por estado
  const conteoEstados = useMemo(() => {
    const conteo = {
      'Todos': complejos.length,
      'APROBADO': 0,
      'RECHAZADO': 0,
      'OCULTO': 0
    };
    
    complejos.forEach(c => {
      if (c.estado === 'APROBADO') conteo.APROBADO++;
      if (c.estado === 'RECHAZADO') conteo.RECHAZADO++;
      if (c.estado === 'OCULTO') conteo.OCULTO++;
    });
    
    return conteo;
  }, [complejos]);

  if (!complejos || complejos.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaBuilding /> Gestión de Complejos
        </h2>
        <p className="text-gray-600">No hay complejos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-6">
        <FaBuilding /> Gestión de Complejos
      </h2>
      
      {/* Botones de Filtro */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['Todos', 'APROBADO', 'RECHAZADO', 'OCULTO'].map((estado) => {
          const esActivo = filtroEstado === estado;
          const cantidad = conteoEstados[estado];
          
          // Colores que coinciden con los badges
          const colores = {
            'Todos': 'bg-gray-200 text-gray-800',
            'APROBADO': 'bg-secondary text-white',
            'RECHAZADO': 'bg-canchaRed text-white',
            'OCULTO': 'bg-gray-400 text-white',
          };
          
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${colores[estado]} ${esActivo ? 'ring-2 ring-offset-2 ring-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
            >
              {estado} ({cantidad})
            </button>
          );
        })}
      </div>

      <ul className="space-y-4">
        {complejosFiltrados.map(complejo => (
          <li key={complejo.id} className="p-4 bg-white rounded-lg flex justify-between items-center">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-semibold text-primary text-lg">{complejo.nombre}</p>
                <span className={`font-bold text-xs px-3 py-1 rounded-full ${getStatusClass(complejo.estado)}`}>
                  {complejo.estado}
                </span>
              </div>
              <p className="text-sm text-secondary">
                {complejo.domicilio ? 
                  `${complejo.domicilio.calle} ${complejo.domicilio.altura}, ${complejo.domicilio.localidad?.nombre || 'Sin localidad'}` 
                  : 'Sin dirección'
                }
              </p>
              <p className="text-xs text-gray-500">
                CUIT: {complejo.cuit} - Usuario: {complejo.usuario?.nombre} {complejo.usuario?.apellido}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/micomplejo/${complejo.id}`}>
                <button className="bg-secondary border-primary text-light px-4 py-2 rounded-md text-sm font-medium hover:bg-primary transition-colors">
                  Ver Detalles
                </button>
              </Link>
              <button 
                onClick={() => onToggleVisibility(complejo)}
                className={`${complejo.estado === 'OCULTO' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white p-2 rounded-full transition-colors shadow-md`}
                title={complejo.estado === 'OCULTO' ? 'Mostrar complejo' : 'Ocultar complejo'}
              >
                {complejo.estado === 'OCULTO' ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => handleOpenRemoveModal(complejo)}
                className="text-canchaRed hover:text-white hover:bg-canchaRed p-2 rounded-full transition-colors shadow-md"
                title="Eliminar complejo"
              >
                  <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <ModalConfirmacion
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleConfirmRemove}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${complejoToRemove?.nombre} de la lista de complejos aprobados?`}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
}

export default ComplejosAprobadosLista;