import React, { useState } from 'react';
import { misReservas as initialReservas } from '../data/reservas';
import PerfilInfo from '../components/PerfilInfo';
import ListaReservas from '../components/ListaReservas';
import ModalReseña from '../components/ModalReseña';
import ModalPago from '../components/ModalPago';

function MisReservasPage() {
    const [usuario, setUsuario] = useState({
        id: 1,
        nombre: 'Pepe González',
        rol: 'Jugador Apasionado',
        email: 'pepegonzalez@gmail.com',
        telefono: '+54 221 123-4567',
        direccion: 'Calle 43 901, La Plata',
        profileImageUrl: 'https://media.istockphoto.com/id/1690733685/es/vídeo/retrato-de-cabeza-feliz-hombre-hispano-guapo.jpg?s=640x640&k=20&c=3V2ex2y88SRJAqm01O0oiwfb0M4uTeaDS8PEDvN95Kw='
    });
    
    const [reservas, setReservas] = useState(initialReservas.filter(r => r.userId === usuario.id));
    const [modalReseñaVisible, setModalReseñaVisible] = useState(false);
    const [reservaParaReseñar, setReservaParaReseñar] = useState(null);
    const [modalPagoVisible, setModalPagoVisible] = useState(false);
    const [reservaParaPagar, setReservaParaPagar] = useState(null);

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
    
    const handleSaveProfile = (datosActualizados) => {
        setUsuario(datosActualizados);
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
            <div className="flex flex-col md:flex-row -mx-4">
                <PerfilInfo usuario={usuario} onSave={handleSaveProfile} />
                <ListaReservas 
                    reservas={reservas} 
                    onCancelReserva={handleCancelReserva}
                    onDejarReseña={handleOpenReseñaModal}
                    onPagarReserva={handleOpenPagoModal}
                />
            </div>

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