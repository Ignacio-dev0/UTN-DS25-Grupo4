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
import { parseFechaBackend, parseHoraBackend, formatearFecha, calcularHoraFin, turnoYaPaso } from '../utils/dateUtils';

function MisReservasPage() {
    const navigate = useNavigate();
    const { isAuthenticated, updateUser, user: contextUser } = useAuth();
    
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
    const [profileLoaded, setProfileLoaded] = useState(false); // Track if profile was initially loaded
    const [filtroEstado, setFiltroEstado] = useState('Todas'); // Estado para el filtro

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
        // Solo cargar perfil una vez al montar, no durante actualizaciones
        if (!isAuthenticated || profileLoaded || isUpdatingProfile) return;
        
        const cargarPerfilUsuario = async () => {
            try {
                const response = await getUserProfile();
                if (response.ok) {
                    const userData = {
                        id: response.user.id,
                        nombre: response.user.nombre,
                        apellido: response.user.apellido,
                        rol: 'Jugador Apasionado', // Esto se puede personalizar según el rol
                        email: response.user.email,
                        telefono: response.user.telefono || '',
                        direccion: response.user.direccion || '', // Campo de dirección libre
                        dni: response.user.dni,
                        profileImageUrl: response.user.image || 'https://media.istockphoto.com/id/1690733685/es/vídeo/retrato-de-cabeza-feliz-hombre-hispano-guapo.jpg?s=640x640&k=20&c=3V2ex2y88SRJAqm01O0oiwfb0M4uTeaDS8PEDvN95Kw='
                    };
                    setUsuario(userData);
                    
                    // Cargar reservas reales del backend
                    await cargarReservas(response.user.id);
                    
                    // Marcar que el perfil fue cargado exitosamente
                    setProfileLoaded(true);
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
    }, [isAuthenticated, navigate, isUpdatingProfile, profileLoaded]);

    // Nueva función para cargar reservas desde el backend
    const cargarReservas = async (usuarioId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/alquileres?clienteId=${usuarioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                console.log('📦 Datos completos del backend:', JSON.stringify(data, null, 2));
                console.log('📊 Total alquileres recibidos:', data.alquileres?.length || 0);
                
                // Log detallado de CADA alquiler
                if (data.alquileres && data.alquileres.length > 0) {
                    console.log('🔍 ANALIZANDO TODOS LOS ALQUILERES:');
                    data.alquileres.forEach((alq, index) => {
                        console.log(`  Alquiler ${index + 1}:`, {
                            id: alq.id,
                            estado: alq.estado,
                            cantidadTurnos: alq.turnos?.length || 0,
                            primerTurno: alq.turnos && alq.turnos.length > 0 ? {
                                fecha: alq.turnos[0].fecha,
                                horaInicio: alq.turnos[0].horaInicio,
                                cancha: alq.turnos[0].cancha?.nroCancha,
                                complejo: alq.turnos[0].cancha?.complejo?.nombre
                            } : 'SIN TURNOS'
                        });
                    });
                }
                
                // Filtrar solo alquileres que tengan turnos
                const alquileresConTurnos = (data.alquileres || []).filter(alquiler => 
                    alquiler.turnos && alquiler.turnos.length > 0
                );
                console.log('✅ Alquileres con turnos:', alquileresConTurnos.length);
                
                const alquileresSinTurnos = (data.alquileres || []).filter(alquiler => 
                    !alquiler.turnos || alquiler.turnos.length === 0
                );
                if (alquileresSinTurnos.length > 0) {
                    console.warn('⚠️ ALQUILERES SIN TURNOS:', alquileresSinTurnos.length, 'alquileres no se mostrarán');
                }
                
                const reservasFormateadas = alquileresConTurnos.map(alquiler => {
                    // Ordenar los turnos por horaInicio para asegurar el orden correcto
                    const turnosOrdenados = [...alquiler.turnos].sort((a, b) => {
                        return new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime();
                    });
                    
                    const primerTurno = turnosOrdenados[0];
                    const ultimoTurno = turnosOrdenados[turnosOrdenados.length - 1];
                    
                    // Validación adicional por si acaso
                    if (!primerTurno || !primerTurno.fecha || !primerTurno.cancha) {
                        console.warn('⚠️ Alquiler con datos incompletos:', alquiler.id);
                        return null;
                    }
                    
                    // Usar utilidad para parsear fecha correctamente (sin problemas de timezone)
                    const fecha = parseFechaBackend(primerTurno.fecha);
                    const fechaFormateada = formatearFecha(fecha);
                    
                    // Parsear horas usando utilidad
                    const horaInicio = parseHoraBackend(primerTurno.horaInicio);
                    const horaInicioUltimo = parseHoraBackend(ultimoTurno.horaInicio);
                    const horaFin = calcularHoraFin(horaInicioUltimo, 1);

                    
                    // Determinar estado basado en el estado del alquiler y pago
                    let estado = 'Pendiente';
                    if (alquiler.estado === 'PAGADO') {
                        estado = 'Confirmada';
                    } else if (alquiler.estado === 'CANCELADO') {
                        estado = 'Cancelada';
                    } else if (alquiler.estado === 'FINALIZADO') {
                        estado = 'Finalizada';
                    }

                    // Auto-finalizar turnos pasados (usando función utilitaria)
                    const yaTermino = turnoYaPaso(primerTurno.fecha, horaFin);
                    
                    console.log(`⏱️ Alquiler ${alquiler.id}:`, {
                        fecha: fechaFormateada,
                        horaInicio: horaInicio,
                        horaFin: horaFin,
                        ahora: new Date().toLocaleString('es-ES'),
                        yaTermino: yaTermino,
                        estado: estado
                    });
                    
                    // Si el turno ya terminó (hora de fin pasó), marcar como finalizado
                    if ((estado === 'Confirmada' || estado === 'Pendiente') && yaTermino) {
                        console.log(`  ⚠️ Auto-finalizando turno ${alquiler.id} porque ya pasó su hora`);
                        estado = 'Finalizada';
                    }
                    
                    // Verificar si el USUARIO ya dejó una reseña en esta CANCHA (en cualquier alquiler)
                    const usuarioYaReseñoCancha = alquiler.usuarioYaReseñoCancha || false;
                    
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
                        reseñada: usuarioYaReseñoCancha, // Verificar si usuario ya reseñó esta cancha
                        userId: usuarioId,
                        createdAt: alquiler.createdAt // Fecha de creación del alquiler
                    };
                });
                
                // Filtrar los null (alquileres con datos incompletos)
                const reservasValidas = reservasFormateadas.filter(r => r !== null);
                console.log('✅ Reservas válidas después de formatear:', reservasValidas.length);
                
                // Log de resumen por estado
                const conteoEstados = {
                    Pendiente: reservasValidas.filter(r => r.estado === 'Pendiente').length,
                    Confirmada: reservasValidas.filter(r => r.estado === 'Confirmada').length,
                    Finalizada: reservasValidas.filter(r => r.estado === 'Finalizada').length,
                    Cancelada: reservasValidas.filter(r => r.estado === 'Cancelada').length
                };
                console.log('📊 RESUMEN POR ESTADO:', conteoEstados);
                
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
                
                // Obtener el canchaId de la reserva que se acaba de reseñar
                const reservaReseñada = reservas.find(r => r.id === datosReseña.reservaId);
                const canchaIdReseñada = reservaReseñada?.canchaId;
                
                // Actualizar estado local: marcar como reseñada TODOS los alquileres de esa cancha
                setReservas(reservas.map(r => {
                    // Si es la misma cancha, marcar como reseñada
                    if (r.canchaId === canchaIdReseñada) {
                        return { ...r, reseñada: true };
                    }
                    return r;
                }));
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/alquileres/${reservaId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'CANCELADO' }),
            });

            if (response.ok) {
                // Actualizar estado local
                setReservas(reservas.map(r => 
                    r.id === reservaId ? { ...r, estado: 'Cancelada' } : r
                ));
                
                console.log('✅ Reserva cancelada exitosamente');
                alert('Reserva cancelada exitosamente');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cancelar la reserva');
            }
        } catch (error) {
            console.error('💥 Error al cancelar reserva:', error);
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
                    // La imagen puede ser: URL http, ruta relativa, o base64
                    if (response.user.image.startsWith('data:')) {
                        // Es base64, usar directamente
                        nuevaImagenUrl = response.user.image;
                    } else if (response.user.image.startsWith('http')) {
                        // Es URL completa
                        nuevaImagenUrl = response.user.image;
                    } else {
                        // Es ruta relativa
                        nuevaImagenUrl = `${API_BASE_URL}${response.user.image}`;
                    }
                } else if (datosActualizados.profileImageData) {
                    // Si se subió una nueva imagen pero aún no tenemos la URL del servidor
                    nuevaImagenUrl = datosActualizados.profileImageUrl || datosActualizados.profileImageData;
                }

                // Actualizar el estado local con los datos actualizados
                const updatedUserData = {
                    ...usuario,
                    nombre: datosActualizados.nombre || usuario.nombre,
                    apellido: datosActualizados.apellido || usuario.apellido,
                    telefono: datosActualizados.telefono || usuario.telefono,
                    direccion: datosActualizados.direccion || usuario.direccion,
                    profileImageUrl: nuevaImagenUrl
                };
                
                console.log('Actualizando usuario local con:', updatedUserData);
                setUsuario(updatedUserData);
                
                // Mapear el rol del backend al formato del frontend
                const mapearRol = (rolBackend) => {
                    const roleMap = {
                        'ADMINISTRADOR': 'admin',
                        'DUENIO': 'owner',
                        'CLIENTE': 'normal'
                    };
                    return roleMap[rolBackend] || contextUser.rol; // Mantener el rol actual si no encuentra match
                };
                
                // Actualizar también el contexto de autenticación con TODOS los datos necesarios
                const rolMapeado = mapearRol(response.user.rol);
                const contextUserData = {
                    ...contextUser, // Mantener todos los datos del contexto actual
                    ...response.user, // Sobrescribir con los datos actualizados del servidor
                    rol: rolMapeado, // Usar el rol mapeado al formato del frontend
                    role: rolMapeado, // También mantener 'role' para compatibilidad
                    correo: response.user.email || contextUser.email,
                    email: response.user.email || contextUser.email,
                    profileImageUrl: nuevaImagenUrl,
                    nombre: response.user.nombre || datosActualizados.nombre,
                    apellido: response.user.apellido || datosActualizados.apellido,
                    telefono: response.user.telefono || datosActualizados.telefono,
                    direccion: response.user.direccion || datosActualizados.direccion
                };
                
                console.log('✅ Actualizando contexto con:', contextUserData);
                updateUser(contextUserData);
                
                // Mostrar mensaje de éxito
                console.log('✅ Perfil actualizado exitosamente');
                alert('✅ Perfil actualizado exitosamente');
                
                // Resetear flag inmediatamente después del éxito - no recargaremos el perfil
                setIsUpdatingProfile(false);
            } else {
                console.error('Error al actualizar perfil:', response.error);
                alert('Error al actualizar el perfil: ' + response.error);
                setIsUpdatingProfile(false);
            }
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            alert('Error de conexión al actualizar el perfil');
            setIsUpdatingProfile(false);
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/alquileres/${reservaParaPagar.id}/pagar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    // Función para filtrar reservas según el estado seleccionado
    const reservasFiltradas = filtroEstado === 'Todas' 
        ? reservas 
        : reservas.filter(reserva => reserva.estado === filtroEstado);

    // Obtener conteo de reservas por estado
    const conteoEstados = {
        'Todas': reservas.length,
        'Pendiente': reservas.filter(r => r.estado === 'Pendiente').length,
        'Confirmada': reservas.filter(r => r.estado === 'Confirmada').length,
        'Finalizada': reservas.filter(r => r.estado === 'Finalizada').length,
        'Cancelada': reservas.filter(r => r.estado === 'Cancelada').length,
    };

    // Verificar si el usuario tiene 2 o más cancelaciones en los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    // Contar cancelaciones usando la fecha de creación de la reserva (createdAt) o la fecha del turno
    const cancelacionesRecientes = reservas.filter(r => {
        if (r.estado !== 'Cancelada') return false;
        
        // Usar createdAt si está disponible, sino usar la fecha de la reserva
        const fechaParaComparar = r.createdAt ? new Date(r.createdAt) : new Date(r.fecha);
        return fechaParaComparar >= hace30Dias;
    }).length;

    const usuarioBloqueado = cancelacionesRecientes >= 2;

    // Log para debug
    console.log('🔍 DEBUG Cancelaciones:', {
        totalReservas: reservas.length,
        canceladas: reservas.filter(r => r.estado === 'Cancelada').length,
        cancelacionesRecientes,
        usuarioBloqueado,
        hace30Dias: hace30Dias.toISOString()
    });

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
                <>
                    {/* Alerta de usuario bloqueado por cancelaciones */}
                    {usuarioBloqueado && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-red-800 font-semibold text-lg">⚠️ Cuenta Suspendida Temporalmente</h3>
                                    <p className="text-red-700 mt-2">
                                        Has alcanzado el límite de <strong>{cancelacionesRecientes} cancelaciones</strong> en los últimos 30 días.
                                    </p>
                                    <p className="text-red-600 mt-1 text-sm">
                                        No podrás realizar nuevas reservas hasta que pasen 30 días desde tu primera cancelación o hasta que un administrador reactive tu cuenta.
                                    </p>
                                    <div className="mt-3 bg-red-100 p-3 rounded">
                                        <p className="text-red-800 text-sm font-medium">
                                            💡 Consejo: Evita cancelaciones frecuentes para mantener tu cuenta activa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Mensaje informativo sobre políticas de cancelación */}
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-blue-800 font-semibold text-sm">📋 Políticas de Reserva y Cancelación</h4>
                                <div className="mt-2 text-blue-700 text-sm space-y-1">
                                    <p>• <strong>Reserva:</strong> Debes reservar con al menos <strong>1 hora de anticipación</strong></p>
                                    <p>• <strong>Cancelación:</strong> Debes cancelar con al menos <strong>2 horas de anticipación</strong></p>
                                    <p>• <strong>Límite:</strong> Máximo <strong>2 cancelaciones cada 30 días</strong>. Exceder este límite suspenderá temporalmente tu cuenta</p>
                                    <p className="mt-2 text-blue-600 text-xs italic">💡 Planifica tus reservas con responsabilidad para mantener tu cuenta activa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row -mx-4">
                        <PerfilInfo usuario={usuario} onSave={handleSaveProfile} turnosFinalizados={turnosFinalizados} />
                        <ListaReservas 
                            reservas={reservasFiltradas} 
                            onCancelReserva={handleCancelReserva}
                            onDejarReseña={handleOpenReseñaModal}
                            onPagarReserva={handleOpenPagoModal}
                            onVerDetalle={handleVerDetalle}
                            filtroEstado={filtroEstado}
                            setFiltroEstado={setFiltroEstado}
                            conteoEstados={conteoEstados}
                        />
                    </div>
                </>
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