import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

    // Este es un helper simple para la API.
    // Si ya tenés un servicio de API (ej: axios), podés usar ese.
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

function MpConnectWallPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Asumimos que tu context tiene un método para get el token
    const { getToken } = useAuth(); 

    const handleConnectMP = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken ? getToken() : localStorage.getItem('token');

            // 1. Pedirle al backend la URL de autorización
            const response = await api.post(
                '/mercadopago/connect-url', 
                {}, // El body está vacío, el ID de usuario lo toma el backend del JWT
                token
            );
            
            const { authUrl } = response;

            // 2. Redirigir al usuario a Mercado Pago
            if (authUrl) {
                window.location.href = authUrl;
            } else {
                throw new Error('No se recibió la URL de autorización');
            }
        }catch (err) {
            console.error("Error al generar link de MP", err);
            setError(err.message || 'No se pudo generar el link de conexión. Intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-lg shadow-xl text-center">
            <img 
                src="https://logodownload.org/wp-content/uploads/2018/02/mercado-pago-logo-1.png" 
                alt="Mercado Pago" 
                className="h-12 mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Un último paso!</h2>
            <p className="text-gray-600 mb-6">
                Para poder publicar tus canchas y recibir pagos directamente en tu cuenta,
                necesitamos que conectes tu cuenta de Mercado Pago.
            </p>
            <p className="text-sm text-gray-500 mb-6">
                (Serás redirigido a la página oficial de Mercado Pago para iniciar sesión de forma segura).
            </p>
                <button
                    onClick={handleConnectMP}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                {loading ? 'Generando link...' : 'Conectar con Mercado Pago'}
                </button>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    );
}

export default MpConnectWallPage;