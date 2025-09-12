import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { misReservas as initialReservas } from '../data/reservas';
import PerfilInfo from '../components/PerfilInfo';
import ListaReservas from '../components/ListaReservas';
import ModalReseña from '../components/ModalReseña';
import ModalPago from '../components/ModalPago';
import { getUserProfile, updateUserProfile } from '../services/auth';

function MisReservasPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [usuario, setUsuario] = useState({
        id: 1,
        nombre: '',
        apellido: '',
        rol: 'Jugador Apasionado',
        email: '',
        telefono: '',
        direccion: '',
        dni: '',
        profileImageUrl: 'https://media.istockphoto.com/id/1690733685/es/vídeo/retrato-de-cabeza-feliz-hombre-hispano-guapo.jpg?s=640x640&k=20&c=3V2ex2y88SRJAqm01O0oiwfb0M4uTeaDS8PEDvN95Kw='
    });
    
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState([]);
    const [modalReseñaVisible, setModalReseñaVisible] = useState(false);
    const [reservaParaReseñar, setReservaParaReseñar] = useState(null);
    const [modalPagoVisible, setModalPagoVisible] = useState(false);
    const [reservaParaPagar, setReservaParaPagar] = useState(null);

    // Verificar autenticación al montar el componente
    useEffect(() => {
        if (!isAuthenticated) {
            // Redirigir silenciosamente sin mostrar error
            navigate('/', { replace: true });
            return;
        }
    }, [isAuthenticated, navigate]);

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        if (!isAuthenticated) return; // No cargar datos si no está autenticado
        
        const cargarPerfilUsuario = async () => {
            try {
                const response = await getUserProfile();
                if (response.ok) {
                    const userData = {
                        id: response.user.id,
                        nombre: `${response.user.nombre} ${response.user.apellido}`,
                        rol: 'Jugador Apasionado', // Esto se puede personalizar según el rol
                        email: response.user.correo,
                        telefono: response.user.telefono || '',
                        direccion: response.user.direccion || '', // Campo de dirección libre
                        dni: response.user.dni,
                        profileImageUrl: response.user.image || 'https://media.istockphoto.com/id/1690733685/es/vídeo/retrato-de-cabeza-feliz-hombre-hispano-guapo.jpg?s=640x640&k=20&c=3V2ex2y88SRJAqm01O0oiwfb0M4uTeaDS8PEDvN95Kw='
                    };
                    setUsuario(userData);
                    
                    // Cargar reservas reales del backend
                    await cargarReservas(response.user.id);
                } else {
                    console.error('Error al cargar perfil:', response.error);
                    // Si hay error al cargar el perfil, redirigir al login
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
                navigate('/login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        cargarPerfilUsuario();
    }, [isAuthenticated, navigate]);

    // Nueva función para cargar reservas desde el backend
    const cargarReservas = async (usuarioId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/alquileres?clienteId=${usuarioId}`);
            if (response.ok) {
                const data = await response.json();
                const reservasFormateadas = (data.alquileres || []).map(alquiler => {
                    const primerTurno = alquiler.turnos[0];
                    const fecha = new Date(primerTurno.fecha);
                    const horaInicio = new Date(primerTurno.horaInicio).toTimeString().slice(0, 5);
                    const horaFin = new Date(primerTurno.horaFin).toTimeString().slice(0, 5);
                    
                    // Determinar estado basado en el estado del alquiler y pago
                    let estado = 'Pendiente';
                    if (alquiler.estado === 'PAGADO') {
                        estado = 'Confirmada';
                    } else if (alquiler.estado === 'CANCELADO') {
                        estado = 'Cancelada';
                    } else if (alquiler.estado === 'FINALIZADO') {
                        estado = 'Finalizada';
                    }

                    return {
                        id: alquiler.id,
                        complejo: primerTurno.cancha?.complejo?.nombre || 'Complejo no especificado',
                        cancha: `Cancha N°${primerTurno.cancha?.nroCancha || 'N/A'}`,
                        fecha: fecha.toISOString().split('T')[0], // YYYY-MM-DD
                        hora: horaInicio,
                        horaFin: horaFin,
                        total: alquiler.turnos.reduce((sum, turno) => sum + turno.precio, 0),
                        estado: estado,
                        reseñada: false, // Por ahora false, se puede implementar en el futuro
                        userId: usuarioId
                    };
                });
                setReservas(reservasFormateadas);
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            // Usar datos mock como fallback
            const reservasUsuario = initialReservas.filter(r => r.userId === usuarioId);
            setReservas(reservasUsuario);
        }
    };

    const handleOpenReseñaModal = (reserva) => {
        setReservaParaReseñar(reserva);
        setModalReseñaVisible(true);
    };

    const handleGuardarReseña = (datosReseña) => {
        console.log('Guardando reseña:', datosReseña);
        setReservas(reservas.map(r => 
            r.id === datosReseña.reservaId ? { ...r, reseñada: true } : r
        ));
        setModalReseñaVisible(false);
        setReservaParaReseñar(null);
    };

    const handleCancelReserva = async (reservaId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/alquileres/${reservaId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'CANCELADO' }),
            });

            if (response.ok) {
                // Actualizar estado local
                setReservas(reservas.map(r => 
                    r.id === reservaId ? { ...r, estado: 'Cancelada' } : r
                ));
                
                // Liberar el turno (marcar como no reservado)
                const reserva = reservas.find(r => r.id === reservaId);
                if (reserva) {
                    // Aquí puedes implementar la lógica para liberar el turno
                    // dependiendo de si es tarde o temprano para la cancelación
                    console.log('Reserva cancelada exitosamente');
                }
            } else {
                throw new Error('Error al cancelar la reserva');
            }
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            alert('Error al cancelar la reserva: ' + error.message);
        }
    };
    
    const handleSaveProfile = async (datosActualizados) => {
        try {
            setLoading(true);
            const response = await updateUserProfile(datosActualizados);
            
            if (response.ok) {
                // Actualizar el estado local con los datos actualizados
                const updatedUserData = {
                    ...usuario,
                    nombre: datosActualizados.nombre,
                    telefono: datosActualizados.telefono,
                    direccion: datosActualizados.direccion,
                    profileImageUrl: datosActualizados.profileImageUrl
                };
                setUsuario(updatedUserData);
                
                // Mostrar mensaje de éxito (opcional)
                console.log('Perfil actualizado exitosamente');
            } else {
                console.error('Error al actualizar perfil:', response.error);
                // Aquí podrías mostrar un mensaje de error al usuario
                alert('Error al actualizar el perfil: ' + response.error);
            }
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            alert('Error de conexión al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPagoModal = (reserva) => {
        setReservaParaPagar(reserva);
        setModalPagoVisible(true);
    };

    const handleConfirmarPago = async (datosPago) => {
        try {
            const response = await fetch(`${API_BASE_URL}/alquileres/${reservaParaPagar.id}/pagar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigoTransaccion: datosPago.codigoTransaccion || `TXN-${Date.now()}`,
                    metodoPago: datosPago.metodoPago || 'TARJETA_CREDITO'
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Pago confirmado exitosamente:', result);
                
                // Actualizar estado local
                setReservas(reservas.map(r => 
                    r.id === reservaParaPagar.id ? { ...r, estado: 'Confirmada' } : r
                ));
                
                setModalPagoVisible(false);
                setReservaParaPagar(null);
                alert('Pago procesado exitosamente');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Error al procesar pago:', error);
            alert('Error al procesar el pago: ' + error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 rounded-lg relative z-10">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando perfil...</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row -mx-4">
                    <PerfilInfo usuario={usuario} onSave={handleSaveProfile} />
                    <ListaReservas 
                        reservas={reservas} 
                        onCancelReserva={handleCancelReserva}
                        onDejarReseña={handleOpenReseñaModal}
                        onPagarReserva={handleOpenPagoModal}
                    />
                </div>
            )}

            {modalReseñaVisible && (
                <ModalReseña
                    reserva={reservaParaReseñar}
                    onGuardar={handleGuardarReseña}
                    onCerrar={() => setModalReseñaVisible(false)}
                />
            )}

            {modalPagoVisible && reservaParaPagar && (
                <ModalPago
                    isOpen={modalPagoVisible}
                    onClose={() => setModalPagoVisible(false)}
                    onConfirmarPago={handleConfirmarPago}
                    turno={{
                        dia: new Date(reservaParaPagar.fecha).toLocaleDateString('es-ES', { weekday: 'long' }),
                        hora: reservaParaPagar.hora,
                        precio: reservaParaPagar.total
                    }}
                />
            )}
        </div>
    );
}

export default MisReservasPage;