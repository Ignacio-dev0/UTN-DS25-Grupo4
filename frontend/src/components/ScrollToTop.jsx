import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Hacer scroll hacia arriba cada vez que cambie la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
