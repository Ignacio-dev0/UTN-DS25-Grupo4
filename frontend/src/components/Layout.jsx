import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Footer from './Footer.jsx';
import { PiCourtBasketball } from "react-icons/pi";
import { Outlet } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-light">
      <header className="bg-primary text-light shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold font-lora hover:text-accent transition-colors">
            <PiCourtBasketball className="h-9 w-8" />
            <span>CanchaYa</span>
          </Link>

          <nav>
            {/* Para que sea log in <a href="/login" className="flex items-center space-x-2 hover:text-accent">
              <UserCircleIcon className="h-8 w-8" />
               <span className="font-semibold">Log in</span>
            </a> */}
            <a href="/mis-reservas" className="flex items-center space-x-2 hover:text-accent">
              <UserCircleIcon className="h-8 w-8" />
              <span className="font-semibold">Mi Perfil</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;