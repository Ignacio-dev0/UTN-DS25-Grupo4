import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Footer from './Footer.jsx';
import { PiCourtBasketball } from "react-icons/pi";
import { useAuth } from '../context/AuthContext.jsx'; 

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderProfileLink = () => {
    if (!isAuthenticated) {
      return (
        <Link to="/login" className="flex items-center space-x-2 hover:text-accent">
          <UserCircleIcon className="h-8 w-8" />
          <span className="font-semibold">Iniciar Sesión</span>
        </Link>
      );
    }
    
    switch (user.rol) {
      case 'admin':
        return (
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="flex items-center space-x-2 hover:text-accent">
              <UserCircleIcon className="h-8 w-8" />
              <span className="font-semibold">Panel Admin</span>
            </Link>
          </div>
        );
      case 'owner':
        return (
          <Link to="/estado-solicitud" className="flex items-center space-x-2 hover:text-accent">
            <UserCircleIcon className="h-8 w-8" />
            <span className="font-semibold">Mi Complejo</span>
          </Link>
        );
      default: 
        return (
          <Link to="/mis-reservas" className="flex items-center space-x-2 hover:text-accent">
            <UserCircleIcon className="h-8 w-8" />
            <span className="font-semibold">Mi Perfil</span>
          </Link>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-light">
      <header className="bg-primary text-light shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold font-lora hover:text-accent transition-colors">
            <PiCourtBasketball className="h-9 w-8" />
            <span>CanchaYa</span>
          </Link>

          <div className="flex items-center space-x-6">
            {renderProfileLink()}
            {isAuthenticated && (
              <button onClick={handleLogout} className="font-semibold text-light hover:text-accent">
                (Salir)
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className={`flex-grow w-full ${isAuthPage ? 'flex items-center justify-center p-4' : ''}`}>
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default Layout;