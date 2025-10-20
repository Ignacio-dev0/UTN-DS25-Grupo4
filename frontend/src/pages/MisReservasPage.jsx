import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { misReservas as initialReservas } from '../data/reservas';
import PerfilInfo from '../components/PerfilInfo';
import ListaReservas from '../components/ListaReservas';
import ModalReseña from '../components/ModalReseña';
import ModalPago from '../components/ModalPago';
import { getUserProfile, updateUserProfile } from '../services/auth';
import { API_BASE_URL } from '../config/api.js';

function MisReservasPage() {
    const navigate = useNavigate();
    const { isAuthenticated, updateUser } = useAuth();
    
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
    const [turnosFinalizados, setTurnosFinalizados] = useState(0);
    const [modalReseñaVisible, setModalReseñaVisible] = useState(false);
    const [reservaParaReseñar, setReservaParaReseñar] = useState(null);
    const [modalPagoVisible, setModalPagoVisible] = useState(false);
    const [reservaParaPagar, setReservaParaPagar] = useState(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
        if (!isAuthenticated || isUpdatingProfile) return; // No cargar datos si no está autenticado o si estamos actualizando perfil
        
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
                        profileImageUrl: response.user.image ? 
                            (response.user.image.startsWith('http') ? response.user.image : `${API_BASE_URL}${response.user.image}`) 
                            : 'https://media.istockphoto.com/id/1690733685/es/vídeo/retrato-de-cabeza-feliz-hombre-hispano-guapo.jpg?s=640x640&k=20&c=3V2ex2y88SRJAqm01O0oiwfb0M4uTeaDS8PEDvN95Kw='
                    };
                    setUsuario(userData);
                    
                    // Cargar reservas reales del backend
                    await cargarReservas(response.user.id);
                } else if (!isUpdatingProfile) {
                    console.error('Error al cargar perfil:', response.error);
                    // Solo redirigir al login si no estamos actualizando perfil
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                if (!isUpdatingProfile) {
                    console.error('Error al cargar perfil:', error);
                    navigate('/login', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        cargarPerfilUsuario();
    }, [isAuthenticated, navigate, isUpdatingProfile]);

    // Nueva función para cargar reservas desde el backend
    const cargarReservas = async (usuarioId) => {
        try {
            console.log('🔍 CARGANDO RESERVAS - Usuario ID:', usuarioId);
            console.log('🔍 URL de consulta:', `${API_BASE_URL}/alquileres?clienteId=${usuarioId}`);
            const response = await fetch(`${API_BASE_URL}/alquileres?clienteId=${usuarioId}`);
            console.log('📡 Respuesta del servidor - Status:', response.status, 'OK:', response.ok);
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Datos recibidos:', data);
                console.log('📊 Total de alquileres:', data.alquileres?.length || 0);
                
                // Filtrar solo alquileres que tengan turnos
                const alquileresConTurnos = (data.alquileres || []).filter(alquiler => 
                    alquiler.turnos && alquiler.turnos.length > 0
                );
                console.log('✅ Alquileres con turnos:', alquileresConTurnos.length);
                
                const reservasFormateadas = alquileresConTurnos.map(alquiler => {
                    const primerTurno = alquiler.turnos[0];
                    
                    // Validación adicional por si acaso
                    if (!primerTurno || !primerTurno.fecha || !primerTurno.cancha) {
                        console.warn('⚠️ Alquiler con datos incompletos:', alquiler.id);
                        return null;
                    }
                    
                    const fecha = new Date(primerTurno.fecha);
                    // Usar UTC para evitar problemas de timezone
                    const fechaInicio = new Date(primerTurno.horaInicio);
                    const horaInicio = `${fechaInicio.getUTCHours().toString().padStart(2, '0')}:${fechaInicio.getUTCMinutes().toString().padStart(2, '0')}`;
                    const fechaFin = new Date(primerTurno.horaFin);
                    const horaFin = `${fechaFin.getUTCHours().toString().padStart(2, '0')}:${fechaFin.getUTCMinutes().toString().padStart(2, '0')}`;
                    
                    // Determinar estado basado en el estado del alquiler y pago
                    let estado = 'Pendiente';
                    if (alquiler.estado === 'PAGADO') {
                        estado = 'Confirmada';
                    } else if (alquiler.estado === 'CANCELADO') {
                        estado = 'Cancelada';
                    } else if (alquiler.estado === 'FINALIZADO') {
                        estado = 'Finalizada';
                    }

                    // Auto-finalizar turnos pasados que estaban confirmados
                    const fechaActual = new Date();
                    fechaActual.setHours(0, 0, 0, 0); // Solo comparar fechas, no horas
                    const fechaTurno = new Date(fecha);
                    fechaTurno.setHours(0, 0, 0, 0);
                    
                    if (estado === 'Confirmada' && fechaTurno < fechaActual) {
                        estado = 'Finalizada';
                        // TODO: Aquí se podría hacer una llamada al backend para actualizar el estado
                        // del alquiler a FINALIZADO si se requiere persistir el cambio
                    }

                    // Formatear fecha a DD/MM/YYYY
                    const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
                    
                    return {
                        id: alquiler.id,
                        canchaId: primerTurno.cancha?.id || null, // Agregar canchaId para navegación
                        complejo: primerTurno.cancha?.complejo?.nombre || 'Complejo no especificado',
                        cancha: `Cancha N°${primerTurno.cancha?.nroCancha || 'N/A'}`,
                        fecha: fechaFormateada, // DD/MM/YYYY
                        hora: horaInicio,
                        horaFin: horaFin,
                        total: alquiler.turnos.reduce((sum, turno) => sum + turno.precio, 0),
                        estado: estado,
                        reseñada: false, // Por ahora false, se puede implementar en el futuro
                        userId: usuarioId
                    };
                });
                
                // Filtrar los null (alquileres con datos incompletos)
                const reservasValidas = reservasFormateadas.filter(r => r !== null);
                console.log('✅ Reservas válidas después de formatear:', reservasValidas.length);
                
                // Ordenar reservas por estado (pendientes primero) y luego por fecha más reciente
                const reservasOrdenadas = reservasValidas.sort((a, b) => {
                    // Definir prioridad de estados
                    const prioridades = {
                        'Pendiente': 1,
                        'Confirmada': 2,
                        'Finalizada': 3,
                        'Cancelada': 4
                    };
                    
                    // Primero ordenar por prioridad de estado
                    const prioridadA = prioridades[a.estado] || 5;
                    const prioridadB = prioridades[b.estado] || 5;
                    
                    if (prioridadA !== prioridadB) {
                        return prioridadA - prioridadB;
                    }
                    
                    // Si tienen el mismo estado, ordenar por fecha (más reciente primero)
                    const fechaA = new Date(a.fecha);
                    const fechaB = new Date(b.fecha);
                    return fechaB - fechaA;
                });
                
                setReservas(reservasOrdenadas);
                
                // Calcular turnos finalizados para el sistema de niveles
                const finalizadas = reservasValidas.filter(r => r.estado === 'Finalizada').length;
                setTurnosFinalizados(finalizadas);
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

    const handleVerDetalle = (reserva) => {
        if (reserva.canchaId) {
            navigate(`/reserva/${reserva.canchaId}`);
        } else {
            alert('No se puede acceder a los detalles de esta reserva');
        }
    };

    const handleGuardarReseña = async (datosReseña) => {
        try {
            console.log('Guardando reseña:', datosReseña);
            
            // Validar datos antes de enviar
            if (!datosReseña.reservaId || !datosReseña.puntaje || !datosReseña.comentario) {
                throw new Error('Todos los campos son requeridos');
            }

            // Asegurar que el puntaje esté entre 1 y 5
            const puntajeNormalizado = Math.max(1, Math.min(5, Math.round(datosReseña.puntaje)));
            
            // Validar que la descripción tenga al menos 10 caracteres
            const descripcionLimpia = datosReseña.comentario.trim();
            if (descripcionLimpia.length < 10) {
                throw new Error('La descripción debe tener al menos 10 caracteres');
            }

            const datosParaEnviar = {
                alquilerId: Number(datosReseña.reservaId), // Asegurar que sea número
                puntaje: puntajeNormalizado, // Puntaje normalizado entre 1-5
                descripcion: descripcionLimpia // Descripción limpia
            };

            console.log('Datos a enviar al backend:', datosParaEnviar);
            
            // Enviar reseña al backend
            const response = await fetch(`${API_BASE_URL}/resenas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datosParaEnviar)
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('Reseña creada exitosamente:', result);
                
                // Actualizar estado local solo si la reseña se guardó exitosamente
                setReservas(reservas.map(r => 
                    r.id === datosReseña.reservaId ? { ...r, reseñada: true } : r
                ));
                alert('¡Reseña guardada exitosamente!');
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.error('Error al parsear respuesta del servidor:', jsonError);
                    errorData = { message: `Error del servidor (${response.status}): ${response.statusText}` };
                }
                console.error('Error del backend:', errorData);
                throw new Error(errorData.message || 'Error al guardar la reseña');
            }
        } catch (error) {
            console.error('Error al guardar reseña:', error);
            
            // Mejor manejo de errores específicos
            let mensajeError = 'Error al guardar la reseña';
            if (error.message) {
                if (error.message.includes('ya tiene una reseña')) {
                    mensajeError = 'Esta reserva ya tiene una reseña.';
                } else if (error.message.includes('no existe')) {
                    mensajeError = 'La reserva no existe o no es válida.';
                } else if (error.message.includes('validación')) {
                    mensajeError = 'Error de validación: ' + error.message;
                } else {
                    mensajeError += ': ' + error.message;
                }
            }
            
            alert(mensajeError);
        } finally {
            setModalReseñaVisible(false);
            setReservaParaReseñar(null);
        }
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
                
                // Liberar el turno si la reserva estaba pendiente
                const reserva = reservas.find(r => r.id === reservaId);
                if (reserva && reserva.estado === 'Pendiente') {
                    try {
                        const turnoResponse = await fetch(`http://localhost:3000/api/turnos/individual/${reserva.turnoId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ reservado: false })
                        });
                        
                        if (turnoResponse.ok) {
                            console.log('Turno liberado exitosamente');
                        } else {
                            console.error('Error al liberar el turno');
                        }
                    } catch (error) {
                        console.error('Error al liberar turno:', error);
                    }
                }
                
                console.log('Reserva cancelada exitosamente');
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
            setIsUpdatingProfile(true);
            setLoading(true);
            
            console.log('Guardando perfil con datos:', datosActualizados);
            
            const response = await updateUserProfile(datosActualizados);
            
            if (response.ok) {
                // Construir la nueva URL de imagen si existe
                let nuevaImagenUrl = usuario.profileImageUrl; // Mantener la actual por defecto
                
                if (response.user.image) {
                    // Si el servidor devolvió una nueva imagen
                    nuevaImagenUrl = response.user.image.startsWith('http') ? 
                        response.user.image : 
                        `${API_BASE_URL}${response.user.image}`;
                } else if (datosActualizados.profileImageData) {
                    // Si se subió una nueva imagen pero aún no tenemos la URL del servidor
                    nuevaImagenUrl = datosActualizados.profileImageUrl || datosActualizados.profileImageData;
                }

                // Actualizar el estado local con los datos actualizados
                const updatedUserData = {
                    ...usuario,
                    nombre: datosActualizados.nombre || usuario.nombre,
                    telefono: datosActualizados.telefono || usuario.telefono,
                    direccion: datosActualizados.direccion || usuario.direccion,
                    profileImageUrl: nuevaImagenUrl
                };
                
                console.log('Actualizando usuario local con:', updatedUserData);
                setUsuario(updatedUserData);
                
                // Actualizar también el contexto de autenticación
                const contextUserData = {
                    ...response.user,
                    role: response.user.rol,
                    email: response.user.correo,
                    profileImageUrl: nuevaImagenUrl,
                    // Mantener los campos necesarios del contexto
                    id: response.user.id || usuario.id,
                    nombre: response.user.nombre || datosActualizados.nombre,
                    apellido: response.user.apellido || usuario.apellido,
                    dni: response.user.dni || usuario.dni,
                    telefono: response.user.telefono || datosActualizados.telefono,
                    direccion: response.user.direccion || datosActualizados.direccion
                };
                
                updateUser(contextUserData);
                
                // Mostrar mensaje de éxito
                console.log('Perfil actualizado exitosamente');
                alert('Perfil actualizado exitosamente');
            } else {
                console.error('Error al actualizar perfil:', response.error);
                alert('Error al actualizar el perfil: ' + response.error);
            }
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            alert('Error de conexión al actualizar el perfil');
        } finally {
            setLoading(false);
            setIsUpdatingProfile(false);
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
                    estado: 'PAGADO',
                    codigoTransaccion: datosPago.codigoTransaccion || `TXN-${Date.now()}`,
                    metodoPago: datosPago.metodoPago || 'CREDITO'
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
                    <PerfilInfo usuario={usuario} onSave={handleSaveProfile} turnosFinalizados={turnosFinalizados} />
                    <ListaReservas 
                        reservas={reservas} 
                        onCancelReserva={handleCancelReserva}
                        onDejarReseña={handleOpenReseñaModal}
                        onPagarReserva={handleOpenPagoModal}
                        onVerDetalle={handleVerDetalle}
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