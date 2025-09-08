// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDeporte, setNewDeporte] = useState('');

  // Cargar solicitudes
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/solicitudes');
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data.solicitudes || []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar deportes
  const fetchDeportes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/deportes');
      if (response.ok) {
        const data = await response.json();
        setDeportes(data.deportes || []);
      }
    } catch (error) {
      console.error('Error cargando deportes:', error);
    }
  };

  // Evaluar solicitud
  const evaluarSolicitud = async (id, estado) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/solicitudes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });

      if (response.ok) {
        alert(`Solicitud ${estado.toLowerCase()} correctamente`);
        fetchSolicitudes(); // Recargar solicitudes
      } else {
        alert('Error al evaluar solicitud');
      }
    } catch (error) {
      console.error('Error evaluando solicitud:', error);
      alert('Error al evaluar solicitud');
    }
  };

  // Crear deporte
  const crearDeporte = async () => {
    if (!newDeporte.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/deportes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: newDeporte }),
      });

      if (response.ok) {
        alert('Deporte creado correctamente');
        setNewDeporte('');
        fetchDeportes(); // Recargar deportes
      } else {
        alert('Error al crear deporte');
      }
    } catch (error) {
      console.error('Error creando deporte:', error);
      alert('Error al crear deporte');
    }
  };

  // Eliminar deporte
  const eliminarDeporte = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este deporte?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/deportes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deporte eliminado correctamente');
        fetchDeportes(); // Recargar deportes
      } else {
        alert('Error al eliminar deporte');
      }
    } catch (error) {
      console.error('Error eliminando deporte:', error);
      alert('Error al eliminar deporte');
    }
  };

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchSolicitudes();
    } else if (activeTab === 'deportes') {
      fetchDeportes();
    }
  }, [activeTab]);

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administrador</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'solicitudes' ? 'active' : ''}
          onClick={() => setActiveTab('solicitudes')}
        >
          Gestionar Solicitudes
        </button>
        <button 
          className={activeTab === 'deportes' ? 'active' : ''}
          onClick={() => setActiveTab('deportes')}
        >
          Gestionar Deportes
        </button>
      </div>

      {/* Tab de Solicitudes */}
      {activeTab === 'solicitudes' && (
        <div className="tab-content">
          <h2>Solicitudes Pendientes</h2>
          {loading ? (
            <div className="loading">Cargando solicitudes...</div>
          ) : (
            <div className="solicitudes-grid">
              {solicitudes.length === 0 ? (
                <p>No hay solicitudes pendientes</p>
              ) : (
                solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="solicitud-card">
                    <h3>Solicitud #{solicitud.id}</h3>
                    <p><strong>CUIT:</strong> {solicitud.cuit}</p>
                    <p><strong>Estado:</strong> {solicitud.estado}</p>
                    <p><strong>Usuario:</strong> {solicitud.usuario?.nombre} {solicitud.usuario?.apellido}</p>
                    <p><strong>Email:</strong> {solicitud.usuario?.correo}</p>
                    
                    {solicitud.estado === 'PENDIENTE' && (
                      <div className="solicitud-actions">
                        <button 
                          className="btn-aprobar"
                          onClick={() => evaluarSolicitud(solicitud.id, 'APROBADA')}
                        >
                          Aprobar
                        </button>
                        <button 
                          className="btn-rechazar"
                          onClick={() => evaluarSolicitud(solicitud.id, 'RECHAZADA')}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab de Deportes */}
      {activeTab === 'deportes' && (
        <div className="tab-content">
          <h2>Gestión de Deportes</h2>
          
          <div className="crear-deporte">
            <h3>Crear Nuevo Deporte</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Nombre del deporte"
                value={newDeporte}
                onChange={(e) => setNewDeporte(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && crearDeporte()}
              />
              <button onClick={crearDeporte}>Crear Deporte</button>
            </div>
          </div>

          <div className="deportes-list">
            <h3>Deportes Existentes</h3>
            {deportes.length === 0 ? (
              <p>No hay deportes registrados</p>
            ) : (
              <div className="deportes-grid">
                {deportes.map((deporte) => (
                  <div key={deporte.id} className="deporte-card">
                    <h4>{deporte.nombre}</h4>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarDeporte(deporte.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
