import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ComplejoInfo from '../components/ComplejoInfo.jsx';
import ListaCanchasComplejo from '../components/ListaCanchasComplejo.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

function MiComplejoPage() {
  const { complejoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [infoDelComplejo, setInfoDelComplejo] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar datos del complejo desde el backend
  useEffect(() => {
    const fetchComplejoData = async () => {
      try {
        setLoading(true);
        
        // Obtener información del complejo
        const complejoResponse = await fetch(`http://localhost:3000/api/complejos/${complejoId}`);
        if (!complejoResponse.ok) {
          throw new Error('Error al cargar el complejo');
        }
        const complejoData = await complejoResponse.json();
        setInfoDelComplejo(complejoData.complejo || complejoData);

        // Obtener canchas del complejo
        const canchasResponse = await fetch(`http://localhost:3000/api/canchas/complejo/${complejoId}`);
        if (!canchasResponse.ok) {
          throw new Error('Error al cargar las canchas');
        }
        const canchasData = await canchasResponse.json();
        const canchasConEstado = (canchasData.canchas || canchasData || []).map(cancha => ({
          ...cancha,
          estado: cancha.activa ? 'habilitada' : 'deshabilitada'
        }));
        setCanchas(canchasConEstado);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (complejoId) {
      fetchComplejoData();
    }
  }, [complejoId]);

  const handleToggleEdit = async () => {
    if(isEditing) {
      try {
        const response = await fetch(`http://localhost:3000/api/complejos/${complejoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(infoDelComplejo),
        });
        
        if (response.ok) {
          console.log("Datos del complejo guardados correctamente");
          alert('Información del complejo actualizada correctamente');
        } else {
          throw new Error('Error al actualizar el complejo');
        }
      } catch (error) {
        console.error('Error guardando datos del complejo:', error);
        alert('Error al guardar los cambios');
      }
    }
    setIsEditing(!isEditing);
  };
  
  const handleDeleteCancha = async (canchaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCanchas(prevCanchas => prevCanchas.filter(cancha => cancha.id !== canchaId));
        alert('Cancha eliminada correctamente');
      } else {
        throw new Error('Error al eliminar la cancha');
      }
    } catch (error) {
      console.error('Error eliminando cancha:', error);
      alert('Error al eliminar la cancha');
    }
  };

  const handleDisableCancha = async (canchaId) => {
    const cancha = canchas.find(c => c.id === canchaId);
    const nuevaActiva = !cancha.activa;
    
    try {
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activa: nuevaActiva }),
      });
      
      if (response.ok) {
        setCanchas(prevCanchas =>
          prevCanchas.map(cancha =>
            cancha.id === canchaId
              ? { ...cancha, activa: nuevaActiva, estado: nuevaActiva ? 'habilitada' : 'deshabilitada' }
              : cancha
          )
        );
        alert(`Cancha ${nuevaActiva ? 'habilitada' : 'deshabilitada'} correctamente`);
      } else {
        throw new Error('Error al actualizar el estado de la cancha');
      }
    } catch (error) {
      console.error('Error actualizando estado de cancha:', error);
      alert('Error al cambiar el estado de la cancha');
    }
  };

  // Obtener últimos alquileres (placeholder por ahora, puedes implementar el endpoint)
  const ultimosAlquileres = [
    { id: 1, cancha: 'Cancha N°5', fecha: '29/06/2025', total: 28000 },
    { id: 2, cancha: 'Cancha N°1', fecha: '29/06/2025', total: 30000 },
  ];

  // Crear turnos para una cancha específica
  const crearTurnos = async (canchaId, turnos) => {
    try {
      const promises = turnos.map(turno => 
        fetch('http://localhost:3000/api/turnos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...turno,
            canchaId: parseInt(canchaId)
          }),
        })
      );

      const responses = await Promise.all(promises);
      const failed = responses.filter(r => !r.ok);
      
      if (failed.length === 0) {
        alert(`${turnos.length} turnos creados correctamente`);
      } else {
        alert(`Se crearon ${responses.length - failed.length} de ${turnos.length} turnos`);
      }
    } catch (error) {
      console.error('Error creando turnos:', error);
      alert('Error al crear turnos');
    }
  };

  // Generar turnos automáticamente para los próximos 7 días
  const generarTurnosAutomaticos = async (canchaId) => {
    if (!confirm('¿Generar turnos automáticamente para los próximos 7 días (9:00 a 22:00)?')) return;
    
    const turnos = [];
    const hoy = new Date();
    
    for (let dia = 1; dia <= 7; dia++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + dia);
      
      for (let hora = 9; hora <= 21; hora++) {
        turnos.push({
          fecha: fecha.toISOString().split('T')[0],
          hora: `${hora.toString().padStart(2, '0')}:00`,
          precio: 15000 // Precio base, puede ser configurable
        });
      }
    }
    
    await crearTurnos(canchaId, turnos);
  };


  let puedeVerLaPagina = false;

  if (isAuthenticated && infoDelComplejo) {
    if (user.role === 'admin') {
      puedeVerLaPagina = true;
    } 
    else if (user.role === 'owner' && parseInt(user.id) === parseInt(infoDelComplejo.usuarioId)) {
      puedeVerLaPagina = true;
    }
  }

  console.log('Debug acceso:', {
    isAuthenticated,
    userRole: user?.role,
    userId: user?.id,
    complejoUsuarioId: infoDelComplejo?.usuarioId,
    puedeVer: puedeVerLaPagina
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (error || !infoDelComplejo) {
    return (
        <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
            <h1 className="text-2xl font-bold text-red-600">
              Error: {error || 'Complejo no encontrado'}
            </h1>
        </div>
    );
  }


  if (!puedeVerLaPagina) {
    return (
      <div className="text-center p-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-2 text-gray-700">No tenés los permisos necesarios para gestionar este complejo.</p>
        <Link to="/" className="mt-4 inline-block bg-primary text-light px-4 py-2 rounded-md">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 rounded-lg relative z-10">
      <h1 className="text-3xl font-bold font-lora text-gray-800 border-b border-gray-200 pb-4 mb-4">
        Mi Complejo
      </h1>
      <div className="flex flex-col md:flex-row -mx-4">
        <ComplejoInfo 
          complejo={infoDelComplejo} 
          alquileres={ultimosAlquileres}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onComplejoChange={setInfoDelComplejo}
        />
        <ListaCanchasComplejo 
          canchas={canchas} 
          onDelete={handleDeleteCancha}
          onDisable={handleDisableCancha}
          onGenerarTurnos={generarTurnosAutomaticos}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default MiComplejoPage;