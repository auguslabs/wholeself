// Importar React para usar componentes funcionales
import React, { useState, useEffect } from 'react';
import { CrisisResourcesModal } from './CrisisResourcesModal';

/**
 * Componente Header - Layout
 * 
 * Encabezado de la aplicación con logo centrado y menú de navegación desplegable.
 * El logo está centrado horizontalmente en toda la pantalla.
 * El menú se despliega desde el centro hacia los lados en desktop.
 */
export function Header() {
  // Usar sessionStorage para mantener el estado del menú durante la navegación
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('menuOpen');
      return saved === 'true';
    }
    return false;
  });
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const menuItems = [
    { href: '/', label: 'home' },
    { href: '/services', label: 'services' },
    { href: '/what-to-expect', label: 'what to expect' },
    { href: '/investment', label: 'investment' },
    { href: '/team', label: 'team' },
    { href: '/contact', label: 'contact' },
  ];

  // Detectar la ruta actual y restaurar el estado del menú
  useEffect(() => {
    // Función para actualizar la ruta
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Función para restaurar el estado del menú desde sessionStorage
    const restoreMenuState = () => {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('menuOpen');
        if (saved === 'true') {
          setIsMenuOpen(true);
        }
      }
    };

    // Establecer la ruta inicial
    updatePath();
    // Restaurar el estado del menú
    restoreMenuState();

    // Escuchar cambios de ruta (para View Transitions)
    const handleLocationChange = () => {
      updatePath();
      // Restaurar el estado del menú después de la transición
      restoreMenuState();
    };

    // Escuchar eventos de navegación
    window.addEventListener('popstate', handleLocationChange);
    
    // Escuchar eventos de View Transitions
    document.addEventListener('astro:page-load', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('astro:page-load', handleLocationChange);
    };
  }, []);

  // Función para verificar si un enlace está activo
  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(href);
  };

  // Guardar el estado del menú en sessionStorage cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('menuOpen', String(isMenuOpen));
    }
  }, [isMenuOpen]);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    // Elemento header principal con fondo blanco, sombra sutil y borde inferior
    <header className="bg-blueGreen-300 shadow-sm w-full">
      {/* Contenedor principal que ocupa todo el ancho */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Flex container para centrar el logo horizontalmente */}
        <div className="flex justify-center items-center h-20 md:h-28 pt-1 md:pt-2">
          {/* Logo centrado - se reemplazará con el SVG cuando esté disponible */}
          <a href="/" className="flex items-center justify-center">
            {/* Logo SVG - se cargará desde /logo.svg */}
            <img 
              src="/logo.svg" 
              alt="Whole Self Counseling"
              className="h-20 md:h-24 w-auto max-w-[400px] md:max-w-[500px]"
            />
            {/* Fallback: texto si el logo no está disponible */}
            <span className="sr-only">Whole Self Counseling</span>
          </a>
        </div>

        {/* Menú tradicional para móvil (oculto en desktop) */}
        <nav className="md:hidden flex justify-center items-center space-x-4 pb-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      
      {/* Menú de navegación desplegable - solo visible en desktop, fuera del contenedor con padding */}
      <div className="hidden md:block w-full overflow-hidden">
        {/* Contenedor de fondo blanco que ocupa 100% del ancho */}
        <div className="w-full bg-white">
          {/* Contenedor del menú bar con grid horizontal - 80% del ancho, centrado */}
          <div className="relative w-[80%] mx-auto flex justify-center items-center min-h-[60px] overflow-hidden">
            {/* Grid horizontal con 7 columnas: 3 izquierda + menu centro + 3 derecha */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 w-full items-center">
            {/* Elementos a la izquierda del menu (índices 0, 1, 2) */}
            {menuItems.slice(0, 3).map((item, index) => {
              const translateX = '-300px';
              const active = isActive(item.href);
              return (
                <div
                  key={item.href}
                  className="flex justify-center items-center py-3"
                  style={{
                    transform: isMenuOpen ? 'translateX(0)' : `translateX(${translateX})`,
                    opacity: isMenuOpen ? 1 : 0,
                    transition: `all 0.7s ease-out ${(2 - index) * 0.08}s`,
                    pointerEvents: isMenuOpen ? 'auto' : 'none',
                  }}
                >
                  <a
                    href={item.href}
                    className={`whitespace-nowrap text-sm px-2 transition-colors ${
                      active
                        ? 'text-gray-900 border-b-[3px] border-blueGreen-500 font-medium'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </div>
              );
            })}
            
            {/* Botón menu/x en el centro (columna 4) */}
            <div className="flex justify-center items-center py-3">
              <button
                type="button"
                onClick={toggleMenu}
                className="text-tealBlue-600 hover:text-tealBlue-700 transition-colors text-base font-medium cursor-pointer px-2"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
              >
                <span className="select-none">{isMenuOpen ? '✕' : 'menu'}</span>
              </button>
            </div>
            
            {/* Elementos a la derecha del menu (índices 3, 4, 5) */}
            {menuItems.slice(3).map((item, index) => {
              const translateX = '300px';
              const active = isActive(item.href);
              return (
                <div
                  key={item.href}
                  className="flex justify-center items-center py-3"
                  style={{
                    transform: isMenuOpen ? 'translateX(0)' : `translateX(${translateX})`,
                    opacity: isMenuOpen ? 1 : 0,
                    transition: `all 0.7s ease-out ${index * 0.08}s`,
                    pointerEvents: isMenuOpen ? 'auto' : 'none',
                  }}
                >
                  <a
                    href={item.href}
                    className={`whitespace-nowrap text-sm px-2 transition-colors ${
                      active
                        ? 'text-gray-900 border-b-[3px] border-blueGreen-500 font-medium'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante de Crisis Resources - siempre visible */}
      <button
        onClick={() => setIsCrisisModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-navy-600 hover:bg-navy-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:ring-offset-2"
        aria-label="Abrir recursos de crisis"
        title="Crisis Resources"
      >
        {/* Ícono de cruz (símbolo universal) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Modal de Crisis Resources */}
      <CrisisResourcesModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />
    </header>
  );
}

