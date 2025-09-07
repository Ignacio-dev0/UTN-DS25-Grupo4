import React, { useState, useEffect } from 'react';
import { misReservas as initialReservas } from '../data/reservas';
import PerfilInfo from '../components/PerfilInfo';
import ListaReservas from '../components/ListaReservas';
import ModalReseña from '../components/ModalReseña';
import ModalPago from '../components/ModalPago';
import { getUserProfile, updateUserProfile } from '../services/auth';

function MisReservasPage() {
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

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
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
                    
                    // Filtrar reservas del usuario actual
                    const reservasUsuario = initialReservas.filter(r => r.userId === response.user.id);
                    setReservas(reservasUsuario);
                } else {
                    console.error('Error al cargar perfil:', response.error);
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarPerfilUsuario();
    }, []);

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

    const handleCancelReserva = (reservaId) => {
        setReservas(reservas.map(r => 
            r.id === reservaId ? { ...r, estado: 'Cancelada' } : r
        ));
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

    const handleConfirmarPago = (datosPago) => {
        console.log('Pago confirmado:', datosPago);
        setReservas(reservas.map(r => 
            r.id === reservaParaPagar.id ? { ...r, estado: 'Confirmada' } : r
        ));
        setModalPagoVisible(false);
        setReservaParaPagar(null);
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