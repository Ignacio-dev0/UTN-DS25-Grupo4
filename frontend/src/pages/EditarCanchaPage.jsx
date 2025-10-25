import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

import GaleriaFotosEditable from '../components/GaleriaFotosEditable.jsx';
import InfoCanchaEditable from '../components/InfoCanchaEditable';
import CalendarioEdicionTurnos from '../components/CalendarioEdicionTurnos.jsx';

// Función helper para obtener coordenadas aproximadas por localidad
  const getCoordinatesForLocation = (domicilio) => {
    // Coordenadas por defecto (La Plata centro)
    let lat = -34.9214;
    let lng = -57.9545;
    
    if (domicilio?.localidad?.nombre) {
      const localidad = domicilio.localidad.nombre.toLowerCase();
      
      // Coordenadas aproximadas para distintas localidades del Gran La Plata
      const coordenadasLocalidades = {
        'la plata': { lat: -34.9214, lng: -57.9545 },
        'berisso': { lat: -34.8713, lng: -57.8794 },
        'ensenada': { lat: -34.8670, lng: -57.9123 },
        'city bell': { lat: -34.8617, lng: -58.0470 },
        'gonnet': { lat: -34.8742, lng: -58.0171 },
        'villa elisa': { lat: -34.8442, lng: -58.0865 },
        'manuel b. gonnet': { lat: -34.8742, lng: -58.0171 },
        'ringuelet': { lat: -34.9067, lng: -57.9861 },
        'tolosa': { lat: -34.9043, lng: -57.9697 },
        'los hornos': { lat: -34.9667, lng: -57.9667 },
        'altos de san lorenzo': { lat: -34.9833, lng: -57.9500 }
      };
      
      const coords = coordenadasLocalidades[localidad];
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        
        // Ajuste fino basado en la calle/altura para La Plata (sistema de calles numeradas)
        if (localidad === 'la plata' && domicilio.calle && domicilio.altura) {
          const calle = domicilio.calle.toLowerCase();
          const altura = parseInt(domicilio.altura);
          
          // La Plata tiene un sistema de cuadrícula con calles numeradas
          // Calles (N-S) vs Avenidas (E-O)
          if (calle.includes('calle') || /\bcalle\s+\d+/.test(calle)) {
            // Calles van de N a S (aumenta latitud hacia el sur)
            const numCalle = parseInt(calle.match(/\d+/)?.[0] || 0);
            if (numCalle > 0) {
              lat = -34.9214 + (numCalle - 50) * 0.0012; // Offset aproximado
            }
          } else if (calle.includes('avenida') || calle.includes('diagonal')) {
            // Avenidas van de E a O (aumenta longitud hacia el oeste)
            const numAvenida = parseInt(calle.match(/\d+/)?.[0] || 0);
            if (numAvenida > 0) {
              lng = -57.9545 - (numAvenida - 7) * 0.0012; // Offset aproximado
            }
          }
          
          // Ajuste por altura de la calle (cuadras)
          if (altura > 0) {
            const cuadras = Math.floor(altura / 100);
            lng += cuadras * 0.0014; // Cada cuadra ~140m en longitud
          }
        }
      }
    }
    
    return { lat, lng };
  };function EditarCanchaPage() {
  const { canchaId } = useParams();
  const navigate = useNavigate();
  
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCanchaData = async () => {
      try {
        setLoading(true);
        
        // Obtener información completa de la cancha
        const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`);
        if (!canchaResponse.ok) {
          if (canchaResponse.status === 404) {
            throw new Error(`La cancha con ID ${canchaId} no existe. Por favor verifica la URL.`);
          }
          throw new Error(`Error al cargar la cancha (${canchaResponse.status})`);
        }
        const canchaData = await canchaResponse.json();
        const canchaInfo = canchaData.cancha || canchaData;
        
        // Cargar reseñas de la cancha
        let puntajeCancha = 0;
        let cantidadReseñas = 0;
        try {
          const reseñasResponse = await fetch(`${API_BASE_URL}/resenas/cancha/${canchaId}`);
          if (reseñasResponse.ok) {
            const reseñasData = await reseñasResponse.json();
            const reseñas = reseñasData.resenas || reseñasData || [];
            cantidadReseñas = reseñas.length;
            if (cantidadReseñas > 0) {
              const sumaSum = reseñas.reduce((sum, r) => sum + (r.puntaje || 0), 0);
              puntajeCancha = sumaSum / cantidadReseñas;
            }
          }
        } catch (error) {
          console.warn('Error al cargar reseñas:', error);
        }
        
        // Cargar turnos reales usando el mismo endpoint que reservas (solo futuros)
        const turnosResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}/semana/0`);
        if (!turnosResponse.ok) {
          console.error('Error en respuesta de turnos:', {
            status: turnosResponse.status,
            statusText: turnosResponse.statusText,
            url: `${API_BASE_URL}/turnos/cancha/${canchaId}/semana/0`
          });
          throw new Error(`Error al cargar turnos: ${turnosResponse.status} ${turnosResponse.statusText}`);
        }
        const turnosData = await turnosResponse.json();
        console.log('Datos de turnos recibidos:', turnosData);
        
        // Función auxiliar para obtener el día de la semana en español (SIN ACENTOS para consistencia)
        const obtenerDiaSemana = (fecha) => {
          const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
          
          // Si la fecha viene como string "2025-10-22", parsearlo correctamente
          let fechaStr = fecha;
          if (fechaStr.includes('T')) {
            fechaStr = fechaStr.split('T')[0]; // Extraer solo la fecha
          }
          
          // Usar Date con componentes individuales para evitar problemas de timezone
          const [year, month, day] = fechaStr.split('-').map(Number);
          const fechaObj = new Date(year, month - 1, day); // month es 0-indexed
          
          return diasSemana[fechaObj.getDay()]; // getDay() usa timezone local
        };

        // Función auxiliar para formatear hora desde ISO string
        const formatearHora = (horaISO) => {
          const fecha = new Date(horaISO);
          // Usar UTC para evitar problemas de timezone
          const horas = fecha.getUTCHours().toString().padStart(2, '0');
          const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
          return `${horas}:${minutos}`;
        };
        
        // Formatear turnos reales (igual que en ReservaPage)
        console.log('📊 Turnos recibidos del backend:', turnosData.turnos || turnosData || []);
        const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => {
          const turnoFormateado = {
            id: turno.id,
            dia: obtenerDiaSemana(turno.fecha),
            hora: formatearHora(turno.horaInicio),
            precio: turno.precio,
            reservado: turno.reservado, // Mantener el campo reservado como booleano
            alquilerId: turno.alquilerId, // Para distinguir entre ocupado manualmente vs reservado por usuario
            deshabilitado: turno.deshabilitado || false, // IMPORTANTE: incluir estado de deshabilitado temporal
            fecha: turno.fecha
          };
          
          // Log solo si está deshabilitado
          if (turno.deshabilitado) {
            console.log('⚠️ Turno DESHABILITADO encontrado:', turnoFormateado);
          }
          
          return turnoFormateado;
        });
        
        // Separar imagen principal de otras imágenes
        const imageArray = canchaInfo.image || [];
        const imagenPrincipal = imageArray.length > 0 ? imageArray[0] : null;
        const otrasImagenes = imageArray.length > 1 ? imageArray.slice(1) : [];
        
        console.log("📸 Imágenes cargadas:", { imagenPrincipal, otrasImagenes });
        
        // Obtener coordenadas del complejo o aproximadas por localidad
        const coordenadas = getCoordinatesForLocation(canchaInfo.complejo?.domicilio);
        const complejoConCoordenadas = {
          ...canchaInfo.complejo,
          lat: canchaInfo.complejo?.lat || coordenadas.lat,
          lng: canchaInfo.complejo?.lng || coordenadas.lng
        };
        
        setCancha({
          ...canchaInfo,
          imageUrl: imagenPrincipal, // Imagen principal
          otrasImagenes: otrasImagenes, // Resto de imágenes
          turnos: turnosFormateados,
          puntaje: puntajeCancha,
          cantidadReseñas: cantidadReseñas
        });
        setComplejo(complejoConCoordenadas);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (canchaId) {
      fetchCanchaData();
    }
  }, [canchaId]);

  const handleSave = async () => {
    try {
      console.log("🔄 Iniciando guardado de cancha...");
      
      // Guardar solo la información básica de la cancha
      console.log("Guardando información básica de la cancha...");
      
      // Combinar imagen principal con otras imágenes
      const todasLasImagenes = [];
      
      // Agregar imagen principal si existe
      if (cancha.imageUrl) {
        todasLasImagenes.push(cancha.imageUrl);
      } else if (cancha.image && cancha.image.length > 0) {
        todasLasImagenes.push(cancha.image[0]);
      }
      
      // Agregar otras imágenes
      if (cancha.otrasImagenes && cancha.otrasImagenes.length > 0) {
        todasLasImagenes.push(...cancha.otrasImagenes);
      }
      
      console.log("📸 Enviando imágenes:", todasLasImagenes);
      
      const token = localStorage.getItem('token');
      const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nroCancha: parseInt(cancha.nroCancha),
          descripcion: cancha.descripcion,
          image: todasLasImagenes, // Enviar todas las imágenes en el array image
          deporteId: cancha.deporteId,
        }),
      });

      if (!canchaResponse.ok) {
        throw new Error('Error al guardar la información de la cancha');
      }
      console.log("✅ Información básica guardada");

      // Solo mostrar mensaje y redirigir - sin tocar cronograma
      alert("✅ ¡Cancha guardada exitosamente!");
      
      // Navegar de vuelta
      setTimeout(() => {
        navigate(`/micomplejo/${cancha.complejoId}`, { 
          replace: true,
          state: { shouldReload: true, timestamp: Date.now() }
        });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error guardando:', error);
      alert('❌ Error al guardar los cambios: ' + error.message);
    }
  };  if (loading) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  if (error || !cancha || !complejo) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">
          {error || 'Cancha no encontrada'}
        </h1>
        <p className="mt-4 text-gray-600">
          Por favor regresa a la página principal y selecciona una cancha válida.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
      <div className="flex justify-between items-center border-b pb-4 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline flex items-center gap-2 mb-2">
              <FaArrowLeft /> Volver
            </button>
            <input 
              type="text"
              value={`Cancha N° ${cancha.nroCancha}`}
              onChange={(e) => setCancha({...cancha, nroCancha: e.target.value.replace('Cancha N° ', '')})}
              className="text-3xl font-bold font-lora text-gray-800 bg-transparent focus:outline-none focus:border-b-2 focus:border-primary"
            />
          </div>
          <button onClick={handleSave} className="bg-primary text-light font-bold py-2 px-6 rounded-md hover:bg-secondary transition-colors flex items-center gap-2">
              <FaSave />
              Guardar Cambios
          </button>
      </div>

      <div className="space-y-12">
        <GaleriaFotosEditable 
          imageUrl={cancha.image?.[0]} 
          otrasImagenes={cancha.otrasImagenes || []} 
          setCancha={setCancha} 
        />
        <InfoCanchaEditable 
          cancha={cancha} 
          complejo={complejo} 
          deporte={cancha.deporte} 
        />
        <CalendarioEdicionTurnos 
          turnos={cancha.turnos} 
          onTurnosChange={(nuevosTurnos) => setCancha(prev => ({...prev, turnos: nuevosTurnos}))} 
          canchaId={cancha.id}
          onPrecioDesdeChange={async (nuevoPrecioDesde) => {
            console.log('💰 Nuevo precio desde calculado:', nuevoPrecioDesde);
            
            // Actualizar estado local inmediatamente (optimistic update)
            setCancha(prev => ({...prev, precioDesde: nuevoPrecioDesde, precioHora: nuevoPrecioDesde}));
            
            // Actualizar en el backend
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/canchas/${cancha.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  precioDesde: nuevoPrecioDesde,
                  precioHora: nuevoPrecioDesde
                })
              });
              
              if (!response.ok) {
                throw new Error('Error al actualizar precio desde');
              }
              
              console.log('✅ Precio desde actualizado en backend:', nuevoPrecioDesde);
            } catch (error) {
              console.error('❌ Error al actualizar precio desde:', error);
              // Aquí podrías revertir el cambio local si el backend falla
            }
          }}
        />
      </div>
    </div>
  );
}

export default EditarCanchaPage;