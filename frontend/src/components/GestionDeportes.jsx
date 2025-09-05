import React, { useState } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaFutbol, FaHockeyPuck } from 'react-icons/fa';
import { GiTennisRacket } from "react-icons/gi";
import ModalDeporte from './ModalDeporte';
import ModalConfirmacion from './ModalConfirmacion';

const deportesMock = [
  { id: 1, nombre: 'Fútbol', icon: <FaFutbol size={32}/> },
  { id: 2, nombre: 'Pádel', icon: <GiTennisRacket size={32}/> },
  { id: 3, nombre: 'Hockey', icon: <FaHockeyPuck size={32}/> },
];

function GestionDeportes() {
  const [deportes, setDeportes] = useState(deportesMock);
  const [isModalDeporteOpen, setIsModalDeporteOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [deporteSeleccionado, setDeporteSeleccionado] = useState(null);


  const handleOpenModalDeporte = (deporte = null) => {
    setDeporteSeleccionado(deporte);
    setIsModalDeporteOpen(true);
  };

  const handleCloseModalDeporte = () => {
    setIsModalDeporteOpen(false);
    setDeporteSeleccionado(null);
  };

  const handleSaveDeporte = (deporteGuardado) => {
    if (deporteGuardado.id) {
      setDeportes(deportes.map(d => d.id === deporteGuardado.id ? { ...d, nombre: deporteGuardado.nombre } : d));
    } else {
      setDeportes([...deportes, { ...deporteGuardado, id: Date.now(), icon: <FaFutbol size={32}/> }]);
    }
    handleCloseModalDeporte();
  };


  const handleOpenModalEliminar = (deporte) => {
    setDeporteSeleccionado(deporte);
    setIsModalEliminarOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deporteSeleccionado) {
      setDeportes(deportes.filter(d => d.id !== deporteSeleccionado.id));
    }
    setIsModalEliminarOpen(false);
    setDeporteSeleccionado(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-secondary mb-6">Gestión de Deportes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <button 
              onClick={() => handleOpenModalDeporte()}
              className="group aspect-square border-2 border-dashed rounded-full flex flex-col items-center justify-center text-accent hover:bg-accent hover:text-primary transition-colors duration-300"
          >
              <FaPlus className="h-12 w-12" />
              <span className="mt-2 font-semibold">Agregar Deporte</span>
          </button>
          
          {deportes.map(deporte => (
              <div key={deporte.id} className="group relative aspect-square bg-white shadow-lg rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <div className="text-primary">{deporte.icon}</div>
                  <span className="mt-2 text-xl font-bold text-gray-800 transition-transform duration-300 group-hover:scale-110">{deporte.nombre}</span>
                  
                  <div className="absolute inset-0 bg-primary bg-opacity-70 rounded-full flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleOpenModalDeporte(deporte)} className="text-white p-3 rounded-full hover:bg-yellow-500 transition-colors" title="Editar">
                          <FaPencilAlt size={22} />
                      </button>
                      <button onClick={() => handleOpenModalEliminar(deporte)} className="text-white p-3 rounded-full hover:bg-red-600 transition-colors" title="Eliminar">
                          <FaTrash size={22} />
                      </button>
                  </div>
              </div>
          ))}
      </div>
      
      <ModalDeporte 
        isOpen={isModalDeporteOpen}
        onClose={handleCloseModalDeporte}
        onSave={handleSaveDeporte}
        deporteActual={deporteSeleccionado}
      />

      {isModalEliminarOpen && (
        <ModalConfirmacion
          isOpen={isModalEliminarOpen}
          onClose={() => setIsModalEliminarOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el deporte "${deporteSeleccionado?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, Eliminar"
        />
      )}
    </div>
  );
}

export default GestionDeportes;