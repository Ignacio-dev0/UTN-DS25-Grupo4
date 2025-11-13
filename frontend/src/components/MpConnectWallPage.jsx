import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

// Helper simple para la API
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
    // Solo necesitamos 'getToken'
    const { getToken } = useAuth(); 

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
                
                // 2. ¡Éxito!
                setMensaje('¡Tu cuenta de Mercado Pago se conectó con éxito!');
                
                // --- INICIO DE LA SOLUCIÓN ---
                // 3. Forzar un "Hard Refresh" en lugar de un 'navigate'
                // Esto obliga a React a reiniciar el AuthContext y
                // cargar el nuevo estado del usuario (con el token de MP).
                setTimeout(() => {
                    // Usamos window.location.href para la recarga.
                    // Te redirige a la ruta que ya tenías en App.jsx
                    window.location.href = '/dashboard-dueño'; 
                }, 2500);
                // --- FIN DE LA SOLUCIÓN ---

            } catch (err) {
                console.error("Error al procesar callback de MP", err);
                setError(err.message || 'Hubo un error al conectar tu cuenta. Por favor, intenta de nuevo desde tu panel.');
            }
        };

        procesarCodigo();
    // Quitamos fetchUser de las dependencias
    }, [location, navigate, getToken]); 

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