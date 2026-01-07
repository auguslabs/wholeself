// Importar React para usar componentes funcionales
import React, { useEffect, useRef, useState } from 'react';

/**
 * Interfaz para los items del menú
 */
interface MenuItem {
  href: string;
  label: string;
}

/**
 * Props del componente MobileMenu
 */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  currentPath: string;
  headerBottom: number; // Posición del borde inferior del header
}

/**
 * Componente MobileMenu - Menú móvil con cajas escalonadas
 * 
 * Muestra las opciones del menú como cajas que aparecen escalonadamente
 * de abajo hacia arriba, ordenadas por número de letras.
 */
export function MobileMenu({
  isOpen,
  onClose,
  menuItems,
  currentPath,
  headerBottom,
}: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Estado para manejar la animación de entrada y salida
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Función para verificar si un enlace está activo
  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(href);
  };

  // Orden fijo de abajo hacia arriba: home (abajo), team, contact, services, investment, what to expect (arriba)
  const orderedItems = [
    menuItems.find(item => item.href === '/') || menuItems[0], // home (abajo)
    menuItems.find(item => item.href === '/team') || menuItems[4], // team
    menuItems.find(item => item.href === '/contact') || menuItems[5], // contact
    menuItems.find(item => item.href === '/services') || menuItems[1], // services
    menuItems.find(item => item.href === '/investment') || menuItems[3], // investment
    menuItems.find(item => item.href === '/what-to-expect') || menuItems[2], // what to expect (arriba)
  ].filter(Boolean); // Filtrar cualquier undefined

  // Manejar animación de entrada y salida
  useEffect(() => {
    // Verificar si estamos en móvil antes de bloquear el scroll
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768; // md breakpoint
    
    if (isOpen && isMobile) {
      // Mostrar el componente primero
      setShouldRender(true);
      // Prevenir scroll del body cuando el menú está abierto (solo en móvil)
      document.body.style.overflow = 'hidden';
      // Pequeño delay para activar la animación de entrada
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      // Iniciar animación de salida
      setIsAnimating(false);
      // Restaurar scroll inmediatamente si no estamos en móvil o si el menú está cerrado
      if (!isMobile || !isOpen) {
        document.body.style.overflow = '';
      }
      // Esperar a que termine la animación antes de ocultar el componente
      setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 500); // Duración de la animación
    }

    return () => {
      // Asegurarse de restaurar el scroll cuando el componente se desmonte
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar menú al hacer clic fuera (en el overlay o fuera del contenedor)
  // Solo activo en móvil (md:hidden)
  useEffect(() => {
    // Verificar si estamos en desktop, si es así no hacer nada
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (!isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Verificar si el clic fue en el overlay o fuera del contenedor
      if (overlayRef.current && (target === overlayRef.current || overlayRef.current.contains(target))) {
        onClose();
        return;
      }
      
      // Verificar si el clic fue fuera del contenedor del menú
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Verificar que no sea un clic en un enlace del menú
        const isMenuLink = target.closest('a[href]');
        if (!isMenuLink) {
          onClose();
        }
      }
    };

    if (isOpen) {
      // Pequeño delay para evitar que se cierre inmediatamente al abrir
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  // Duración de animaciones (0.5s más rápido que antes)
  const containerDuration = 500; // Duración de animación del contenedor (ms) - igual que el modal
  const itemDuration = 300; // Duración de animación de cada elemento (ms) - reducido de 600ms a 300ms
  const itemDelay = 100; // Delay entre elementos (ms) - reducido de 600ms a 100ms (0.5s más rápido)

  // Calcular anchos progresivos (embudo escalonado)
  // La primera caja (what to expect, index 0) tiene 80% de ancho
  // Cada caja siguiente se reduce en 20% respecto a la anterior
  const getBoxWidth = (index: number, total: number) => {
    // Empezar con 80% para la primera caja (index 0)
    // Cada caja siguiente es 80% del tamaño de la anterior (reducción del 20%)
    const baseWidth = 80; // 80% para la primera caja
    const widthPercentage = baseWidth * Math.pow(0.8, index); // Reducir 20% cada vez (multiplicar por 0.8)
    return `${widthPercentage}%`;
  };

  return (
    <>
      {/* Overlay de fondo blurry que muestra el fondo de la página */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-[60] md:hidden transition-opacity duration-500"
        style={{
          opacity: isAnimating ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Contenedor principal que se desliza desde abajo */}
      <div
        ref={containerRef}
        className="fixed left-0 right-0 z-[70] md:hidden bg-white/95 backdrop-blur-sm shadow-lg transform transition-transform duration-500 ease-out"
        style={{
          top: `${headerBottom}px`,
          bottom: 0,
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
        }}
        onClick={(e) => e.stopPropagation()} // Prevenir que los clics dentro del contenedor se propaguen
      >
        {/* Contenedor de las cajas escalonadas - orden de abajo hacia arriba */}
        <div className="flex-1 flex flex-col justify-end items-center px-4 gap-3 overflow-y-auto pb-8 pt-8">
          {orderedItems.map((item, index) => {
            const active = isActive(item.href);
            // Cada elemento aparece después de que el contenedor termine de animarse
            // Contenedor: 500ms, luego cada elemento aparece escalonadamente
            const delay = containerDuration + (index * itemDelay);
            
            return (
              <a
                key={item.href}
                href={item.href}
                data-astro-transition-scroll="false"
                onClick={(e) => {
                  // Cerrar el menú inmediatamente
                  onClose();
                  // Limpiar el estado del menú en sessionStorage para que no se restaure
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('menuOpen', 'false');
                  }
                }}
                className="block w-full max-w-[90%]"
                aria-label={`Navegar a ${item.label}`}
                style={{
                  opacity: isAnimating ? 1 : 0,
                  transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity ${itemDuration}ms ease-out, transform ${itemDuration}ms ease-out`,
                  transitionDelay: `${delay}ms`,
                }}
              >
                {/* Caja individual */}
                <div
                  className={`
                    rounded-lg px-6 py-4 text-center font-medium text-white
                    transition-all duration-300 hover:scale-105 hover:shadow-xl
                    ${active 
                      ? 'bg-tealBlue-700 shadow-lg' 
                      : 'bg-tealBlue-600 shadow-md'
                    }
                  `}
                  style={{
                    borderRadius: '12px',
                  }}
                >
                  {item.label}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

