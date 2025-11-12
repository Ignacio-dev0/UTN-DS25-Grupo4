import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Asumo el mismo 'api' helper que en el componente MpConnectWall
const api = {
    post: async (endpoint, body, token) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la petición a la API');
        }
        return response.json();
    }
};

function MpCallbackPage() {
    const [mensaje, setMensaje] = useState('Verificando conexión, por favor espera...');
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    // Asumo que tu context tiene 'getToken' y 'fetchUser' (o 'refreshUser')
    const { getToken, fetchUser } = useAuth(); 

    useEffect(() => {
        const procesarCodigo = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state'); // El ID del usuario que pasamos

            if (!code) {
                setError('Error: No se recibió el código de autorización.');
                return;
            }

            try {
                const token = getToken ? getToken() : localStorage.getItem('token');

                // 1. Enviamos el código al backend para que lo cambie por el token
                await api.post(
                    '/mercadopago/authorize-connect', 
                    { code, state },
                    token
                );
                
                // 2. Refrescar los datos del usuario en el AuthContext
                // para que 'user' ahora tenga 'mpAccessToken'
                if (fetchUser) {
                    await fetchUser(); 
                }

                // 3. ¡Éxito!
                setMensaje('¡Tu cuenta de Mercado Pago se conectó con éxito!');
                
                // 4. Redirigir al panel del dueño
                // El backend actualizó el complejo a 'APROBADO'
                // y el 'fetchUser' actualizó el 'user'.
                // Necesitamos volver a la página de "MiComplejo"
                // PERO no sabemos el ID del complejo desde aquí fácilmente.
                // La forma más fácil es navegar a una ruta "genérica" de dashboard
                // que se encargue de buscar el complejo del dueño.
                // Por ahora, te mando a una ruta genérica.
                setTimeout(() => {
                    navigate('/dashboard-dueño'); // Cambia esto por tu ruta principal de dueño
                }, 2500);

            } catch (err) {
                console.error("Error al procesar callback de MP", err);
                setError(err.message || 'Hubo un error al conectar tu cuenta. Por favor, intenta de nuevo desde tu panel.');
            }
        };

        procesarCodigo();
    }, [location, navigate, getToken, fetchUser]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                {error ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error de Conexión</h2>
                        <p className="text-gray-700">{error}</p>
                    </>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">{mensaje}</h2>
                    </>
                )}
            </div>
        </div>
    );
}

export default MpCallbackPage;