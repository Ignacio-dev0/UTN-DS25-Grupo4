import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { API_BASE_URL } from '../config/api.js';

function EstadoSolicitudPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/solicitudes?usuarioId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const solicitudUsuario = data.solicitudes?.find(s => s.usuarioId === user.id);
          setSolicitud(solicitudUsuario);

          // Si la solicitud está aprobada y ya fue vista antes, redirigir a Mi Complejo
          if (solicitudUsuario?.estado === 'APROBADA' && solicitudUsuario?.complejo) {
            const solicitudVistaKey = `solicitud_vista_${user.id}`;
            const yaVista = localStorage.getItem(solicitudVistaKey);
            
            if (yaVista === 'true') {
              // Redirigir directamente a Mi Complejo
              navigate(`/micomplejo/${solicitudUsuario.complejo.id}`);
              return;
            } else {
              // Marcar como vista automáticamente cuando se muestra por primera vez
              localStorage.setItem(solicitudVistaKey, 'true');
            }
          }
        }
      } catch (error) {
        console.error('Error cargando solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSolicitud();
    }
  }, [user?.id, navigate]);

  if (loading) {
    return <LoadingSpinner message="Verificando estado de solicitud..." />;
  }

  if (!solicitud) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <FaTimesCircle className="mx-auto h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No se encontró solicitud</h2>
        <p className="text-gray-600 mb-6">
          No hay una solicitud de complejo asociada a tu cuenta.
        </p>
        <button
          onClick={() => window.location.href = '/registro'}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Registrar Complejo
        </button>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (solicitud.estado) {
      case 'PENDIENTE':
        return {
          icon: <FaClock className="mx-auto h-20 w-20 text-yellow-500 mb-6" />,
          title: 'Solicitud en Revisión',
          message: 'Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email cuando tengamos una respuesta.',
          color: 'yellow'
        };
      case 'APROBADA':
        return {
          icon: <FaCheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />,
          title: 'Solicitud Aprobada',
          message: '¡Felicitaciones! Tu complejo ha sido aprobado. Ya puedes gestionar tus canchas y turnos.',
          color: 'green'
        };
      case 'RECHAZADA':
        return {
          icon: <FaTimesCircle className="mx-auto h-20 w-20 text-red-500 mb-6" />,
          title: 'Solicitud Rechazada',
          message: 'Lamentablemente tu solicitud ha sido rechazada. Puedes contactarnos para más información.',
          color: 'red'
        };
      default:
        return {
          icon: <FaClock className="mx-auto h-20 w-20 text-gray-500 mb-6" />,
          title: 'Estado Desconocido',
          message: 'No se pudo determinar el estado de tu solicitud.',
          color: 'gray'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {statusInfo.icon}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{statusInfo.title}</h2>
        <p className="text-gray-600 mb-6">{statusInfo.message}</p>
        
        {solicitud.complejo && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de tu Complejo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">{solicitud.complejo.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CUIT</p>
                <p className="font-semibold">{solicitud.cuit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-semibold">
                  {solicitud.complejo.domicilio?.calle} {solicitud.complejo.domicilio?.altura}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Localidad</p>
                <p className="font-semibold">{solicitud.complejo.domicilio?.localidad?.nombre}</p>
              </div>
            </div>
          </div>
        )}

        {solicitud.estado === 'APROBADA' && (
          <button
            onClick={() => {
              // Navegar a Mi Complejo (ya está marcado como visto en el useEffect)
              navigate(`/micomplejo/${solicitud.complejo.id}`);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Gestionar Mi Complejo
          </button>
        )}
      </div>
    </div>
  );
}

export default EstadoSolicitudPage;
