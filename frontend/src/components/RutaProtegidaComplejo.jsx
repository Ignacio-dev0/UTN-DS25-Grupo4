import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RutaProtegidaComplejo() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Verificando permisos...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Permitir acceso a administradores y dueños
  if (user.rol !== 'admin' && user.rol !== 'owner') {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-2 text-gray-700">Solo los administradores y dueños de complejos pueden acceder a esta página.</p>
        <div className="mt-4 space-x-4">
          <Link to="/" className="inline-block bg-primary text-light px-4 py-2 rounded-md">Volver al inicio</Link>
          <Link to="/login" className="inline-block bg-secondary text-light px-4 py-2 rounded-md">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default RutaProtegidaComplejo;
