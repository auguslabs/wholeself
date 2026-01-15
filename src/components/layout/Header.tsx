// Importar React para usar componentes funcionales
import React, { useState, useEffect, useRef } from 'react';
import { CrisisResourcesModal } from './CrisisResourcesModal';
import { MobileMenu } from './MobileMenu';
import { getPageContent, getLocalizedText } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';

/**
 * Componente Header - Layout
 * 
 * Encabezado de la aplicación con logo centrado y menú de navegación desplegable.
 * El logo está centrado horizontalmente en toda la pantalla.
 * El menú se despliega desde el centro hacia los lados en desktop.
 */
export function Header() {
  // Estado del menú - siempre inicializar como false
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar si debe animarse (solo cuando se hace clic en menu/x)
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Restaurar estado desde sessionStorage solo en móvil y solo una vez al montar
  // En desktop, mantener el menú abierto si estaba abierto
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Asegurarse de que el scroll esté habilitado al cargar la página
      document.body.style.overflow = '';
      
      // Solo restaurar el estado del menú si estamos en móvil
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (isMobile) {
        const saved = sessionStorage.getItem('menuOpen');
        // Solo restaurar si explícitamente está en 'true'
        // Si es 'false' o no existe, mantener cerrado
        if (saved === 'true') {
          setIsMenuOpen(true);
        } else {
          // Asegurarse de que esté cerrado
          setIsMenuOpen(false);
          sessionStorage.setItem('menuOpen', 'false');
        }
      } else {
        // En desktop, mantener el estado del menú desde sessionStorage
        const saved = sessionStorage.getItem('menuOpenDesktop');
        if (saved === 'true') {
          setIsMenuOpen(true);
          // Si el menú estaba abierto, no animar (ya está visible)
          setShouldAnimate(false);
        }
      }
    }
  }, []); // Solo ejecutar una vez al montar
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const headerRef = useRef<HTMLElement>(null);
  const [headerBottom, setHeaderBottom] = useState(0);
  const isTogglingRef = useRef(false);
  
  // Estado para datos de Crisis Resources
  const [crisisData, setCrisisData] = useState<ContentPage | null>(null);
  const currentLang = 'en'; // TODO: Detectar desde URL o navegador
  
  // Cargar datos de Crisis Resources
  useEffect(() => {
    const loadCrisisData = async () => {
      try {
        const data = await getPageContent('crisis-resources');
        setCrisisData(data);
      } catch (error) {
        console.error('Error loading crisis resources data:', error);
      }
    };
    loadCrisisData();
  }, []);

  // Escuchar evento custom para abrir el modal desde el Footer
  useEffect(() => {
    const handleOpenCrisisModal = () => {
      setIsCrisisModalOpen(true);
    };

    window.addEventListener('openCrisisModal', handleOpenCrisisModal);

    return () => {
      window.removeEventListener('openCrisisModal', handleOpenCrisisModal);
    };
  }, []);

  // Estado para controlar la visibilidad del botón de Crisis Resources en móvil
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Escuchar eventos del modal del equipo para ocultar/mostrar el botón de Crisis Resources en móvil
  useEffect(() => {
    const handleTeamModalOpened = () => {
      setIsTeamModalOpen(true);
    };

    const handleTeamModalClosed = () => {
      setIsTeamModalOpen(false);
    };

    window.addEventListener('teamModalOpened', handleTeamModalOpened);
    window.addEventListener('teamModalClosed', handleTeamModalClosed);

    return () => {
      window.removeEventListener('teamModalOpened', handleTeamModalOpened);
      window.removeEventListener('teamModalClosed', handleTeamModalClosed);
    };
  }, []);

  const menuItems = [
    { href: '/', label: 'home' },
    { href: '/services', label: 'services' },
    { href: '/what-to-expect', label: 'what to expect' },
    { href: '/rates', label: 'rates' },
    { href: '/team', label: 'team' },
    { href: '/contact', label: 'contact' },
  ];

  // Detectar la ruta actual
  useEffect(() => {
    // Función para actualizar la ruta
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Establecer la ruta inicial
    updatePath();

    // Escuchar cambios de ruta (para View Transitions)
    const handleLocationChange = () => {
      updatePath();
    };

    // Escuchar eventos de navegación
    window.addEventListener('popstate', handleLocationChange);
    
    // Escuchar eventos de View Transitions
    const handlePageLoad = () => {
      handleLocationChange();
      // En desktop, mantener el menú abierto después de la navegación
      // NO animar cuando cambia la página, solo mantener el estado
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        if (!isMobile) {
          const saved = sessionStorage.getItem('menuOpenDesktop');
          if (saved === 'true') {
            setIsMenuOpen(true);
            // No animar cuando cambia la página
            setShouldAnimate(false);
          }
        } else {
          // En móvil, asegurarse de que el menú esté cerrado después de navegar
          const saved = sessionStorage.getItem('menuOpen');
          if (saved !== 'true') {
            setIsMenuOpen(false);
          }
        }
      }
    };
    
    document.addEventListener('astro:page-load', handlePageLoad);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('astro:page-load', handlePageLoad);
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
  // Usar un timeout pequeño para evitar interferir con el toggle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          // En móvil, guardar el estado
          sessionStorage.setItem('menuOpen', String(isMenuOpen));
          // Si el menú se cierra, asegurarse de que no se restaure después de navegar
          if (!isMenuOpen) {
            sessionStorage.setItem('menuOpen', 'false');
          }
        } else {
          // En desktop, guardar en una clave separada
          sessionStorage.setItem('menuOpenDesktop', String(isMenuOpen));
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isMenuOpen]);

  // Resetear shouldAnimate después de que termine la animación
  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 800); // Tiempo suficiente para que termine la animación (0.7s + margen)
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Cerrar el menú cuando se hace clic fuera (solo en desktop)
  useEffect(() => {
    if (typeof window !== 'undefined' && isMenuOpen) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          // Verificar si el clic fue fuera del header completo
          if (headerRef.current && !headerRef.current.contains(target)) {
            setIsMenuOpen(false);
            setShouldAnimate(true); // Animar al cerrar
          }
        };

        // Usar un pequeño delay para evitar que se cierre inmediatamente al abrir
        const timeoutId = setTimeout(() => {
          document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
          clearTimeout(timeoutId);
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }
  }, [isMenuOpen]);

  // Calcular la posición del borde inferior del header para el menú móvil
  useEffect(() => {
    const updateHeaderBottom = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      }
    };

    updateHeaderBottom();
    window.addEventListener('resize', updateHeaderBottom);
    window.addEventListener('scroll', updateHeaderBottom);

    return () => {
      window.removeEventListener('resize', updateHeaderBottom);
      window.removeEventListener('scroll', updateHeaderBottom);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir doble clic
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    
    // Usar función callback para asegurar que usamos el estado más actualizado
    setIsMenuOpen((prevState) => {
      const newState = !prevState;
      // Guardar el nuevo estado en sessionStorage inmediatamente
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          sessionStorage.setItem('menuOpen', String(newState));
        } else {
          sessionStorage.setItem('menuOpenDesktop', String(newState));
        }
      }
      return newState;
    });
    
    // Solo animar cuando se hace clic en el botón menu/x
    setShouldAnimate(true);
    
    // Resetear el flag después de un breve delay
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 300);
  };

  return (
    // Elemento header principal con fondo blanco, sombra sutil y borde inferior
    // Sticky en desktop para mantenerlo fijo al hacer scroll
    // overflow-visible permite que el logo se desborde hacia abajo
    // z-index alto para asegurar que el botón menu/x siempre sea visible sobre el menú móvil
    <header ref={headerRef} className="bg-blueGreen-300 shadow-sm w-full md:sticky md:top-0 md:z-50 relative z-[80] overflow-visible">
      {/* Contenedor principal que ocupa todo el ancho */}
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* Flex container para centrar el logo horizontalmente - permite overflow hacia abajo */}
        <div className="flex justify-center items-start h-20 md:h-28 pt-1 md:pt-2 overflow-visible">
          {/* Logo centrado - se reemplazará con el SVG cuando esté disponible */}
          <a href="/" data-astro-transition-scroll="false" className="flex items-center justify-center">
            {/* Logo SVG - se cargará desde /logo.svg - crece hacia abajo desde el borde superior */}
            <img 
              src="/logo.svg" 
              alt="Whole Self Counseling"
              className="h-[8.4rem] md:h-[10.8rem] w-auto max-w-[480px] md:max-w-[600px]"
            />
            {/* Fallback: texto si el logo no está disponible */}
            <span className="sr-only">Whole Self Counseling</span>
          </a>
        </div>

        {/* Botón menu para móvil (oculto en desktop) - ajustado para no quedar tapado por el logo */}
        {/* z-index alto para asegurar que siempre sea visible incluso cuando el menú está abierto */}
        {/* El botón cambia de "menu" a "✕" cuando el menú está abierto - única X visible en móvil */}
        {/* Espaciado duplicado entre logo y botón menu para mejor visibilidad */}
        <nav className="md:hidden flex justify-center items-center pb-4 pt-12 mt-4 relative z-[85]">
          <button
            type="button"
            onClick={toggleMenu}
            className="text-tealBlue-600 hover:text-tealBlue-700 transition-colors text-base font-medium cursor-pointer px-2 relative z-[85]"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <span className="select-none">{isMenuOpen ? '✕' : 'menu'}</span>
          </button>
        </nav>
      </div>
      
      {/* Menú de navegación desplegable - solo visible en desktop, fuera del contenedor con padding */}
      <div className="hidden md:block w-full overflow-hidden translate-y-[20px]">
        {/* Contenedor de fondo blanco que ocupa 100% del ancho - padding top para evitar que quede oculto por el logo */}
        <div className="w-full bg-transparent pt-[2.2rem] pb-[0.6rem]">
          {/* Contenedor del menú bar con grid horizontal - 80% del ancho, centrado */}
          <div className="relative w-[80%] mx-auto flex justify-center items-center min-h-[60px] overflow-hidden">
            {/* Grid horizontal con 7 columnas: 3 izquierda + menu centro + 3 derecha */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 w-full items-center">
            {/* Elementos a la izquierda del menu (índices 0, 1, 2) */}
            {menuItems.slice(0, 3).map((item, index) => {
              const translateX = '-300px';
              const active = isActive(item.href);
              // Solo animar si shouldAnimate es true, de lo contrario mantener posición
              const shouldShow = isMenuOpen;
              return (
                <div
                  key={item.href}
                  className="flex justify-center items-center py-3"
                  style={{
                    transform: shouldShow ? 'translateX(0)' : `translateX(${translateX})`,
                    opacity: shouldShow ? 1 : 0,
                    transition: shouldAnimate ? `all 0.7s ease-out ${(2 - index) * 0.08}s` : 'none',
                    pointerEvents: shouldShow ? 'auto' : 'none',
                  }}
                >
                  <a
                    href={item.href}
                    data-astro-transition-scroll="false"
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
              // Solo animar si shouldAnimate es true, de lo contrario mantener posición
              const shouldShow = isMenuOpen;
              return (
                <div
                  key={item.href}
                  className="flex justify-center items-center py-3"
                  style={{
                    transform: shouldShow ? 'translateX(0)' : `translateX(${translateX})`,
                    opacity: shouldShow ? 1 : 0,
                    transition: shouldAnimate ? `all 0.7s ease-out ${index * 0.08}s` : 'none',
                    pointerEvents: shouldShow ? 'auto' : 'none',
                  }}
                >
                  <a
                    href={item.href}
                    data-astro-transition-scroll="false"
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

      {/* Botón flotante de Crisis Resources - oculto en móvil cuando el modal del equipo está abierto */}
      <button
        onClick={() => setIsCrisisModalOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-navy-600 hover:bg-navy-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:ring-offset-2 ${
          isTeamModalOpen ? 'hidden md:flex' : 'flex'
        }`}
        aria-label={crisisData?.content?.button ? getLocalizedText(crisisData.content.button.ariaLabel, currentLang) : 'Open crisis resources'}
        title={crisisData?.content?.button ? getLocalizedText(crisisData.content.button.title, currentLang) : 'Crisis Resources'}
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
        language={currentLang}
      />

      {/* Menú móvil - solo se muestra en móvil y cuando está abierto */}
      {isMenuOpen && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          menuItems={menuItems}
          currentPath={currentPath}
          headerBottom={headerBottom}
        />
      )}
    </header>
  );
}

