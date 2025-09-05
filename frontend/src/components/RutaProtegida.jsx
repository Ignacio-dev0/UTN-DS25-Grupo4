import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RutaProtegida({ rolRequerido }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Verificando permisos...</div>;
  }

  if (!isAuthenticated) {
    alert("Debes iniciar sesión para acceder a esta página.");
    return <Navigate to="/login" />;
  }
  
  if (user.role !== rolRequerido) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-2 text-gray-700">No tenés los permisos necesarios para ver esta página.</p>
        <Link to="/" className="mt-4 inline-block bg-primary text-light px-4 py-2 rounded-md">Volver al inicio</Link>
      </div>
    );
  }

  return <Outlet />;
}

export default RutaProtegida;