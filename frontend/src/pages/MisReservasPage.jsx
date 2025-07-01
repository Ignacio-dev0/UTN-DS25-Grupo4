import React from 'react';
import { Link } from 'react-router-dom';

function MisReservasPage() {
    const misReservas = [
        { id: 1, complejoId: 1, canchaId: 101, complejo: 'Complejo El Potrero', cancha: 'Cancha N°5', fecha: '2025-07-10', hora: '20:00', estado: 'Confirmada' },
        { id: 2, complejoId: 2, canchaId: 102, complejo: 'Fútbol City', cancha: 'Cancha N°1', fecha: '2025-07-12', hora: '21:00', estado: 'Confirmada' },
        { id: 3, complejoId: 33, canchaId: 601, complejo: 'Club de Tenis La Plata', cancha: 'Cancha N°1', fecha: '2025-07-15', hora: '10:00', estado: 'Confirmada' },
    ];

    return (
        <div className="container mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold font-lora text-primary border-b border-gray-300 pb-4 mb-8">
                Mis Reservas
            </h1>
            <div className="space-y-4">
                {misReservas.length > 0 ? (
                    misReservas.map(reserva => (
                        <div key={reserva.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="font-semibold text-primary text-lg">{reserva.complejo} - {reserva.cancha}</p>
                                <p className="text-sm text-secondary">Fecha: {reserva.fecha} a las {reserva.hora}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-accent text-primary font-bold text-sm px-3 py-1 rounded-full">Confirmada</span>
                                <Link to={`/reserva/${reserva.canchaId}`}>
                                    <button className="bg-primary text-light px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors whitespace-nowrap">
                                        Ver Cancha
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">Aún no tienes reservas.</p>
                )}
            </div>
        </div>
    );
}

export default MisReservasPage;
