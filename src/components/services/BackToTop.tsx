/**
 * Back to Top Component
 * 
 * Botón flotante que aparece al hacer scroll para volver arriba
 */

import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar botón después de hacer scroll 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-tealBlue-500 hover:bg-tealBlue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Back to top"
    >
      <ArrowUpIcon className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" />
    </button>
  );
}
