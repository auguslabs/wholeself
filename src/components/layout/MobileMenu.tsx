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
  // Estado para manejar la animación de entrada (igual que CrisisResourcesModal)
  const [isAnimating, setIsAnimating] = useState(false);

  // Función para verificar si un enlace está activo
  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(href);
  };

  // Orden fijo de abajo hacia arriba: home (abajo), team, contact, services, investment, what to expect (arriba)
  // Array invertido para que home aparezca abajo con justify-end
  const orderedItems = [
    menuItems.find(item => item.href === '/what-to-expect') || menuItems[2], // what to expect (arriba)
    menuItems.find(item => item.href === '/investment') || menuItems[3], // investment
    menuItems.find(item => item.href === '/services') || menuItems[1], // services
    menuItems.find(item => item.href === '/contact') || menuItems[5], // contact
    menuItems.find(item => item.href === '/team') || menuItems[4], // team
    menuItems.find(item => item.href === '/') || menuItems[0], // home (abajo)
  ].filter(Boolean); // Filtrar cualquier undefined

  // Manejar animación de entrada (igual que CrisisResourcesModal)
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el menú está abierto
      document.body.style.overflow = 'hidden';
      // Pequeño delay para activar la animación (igual que el modal)
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar menú al hacer clic fuera (en el overlay o fuera del contenedor)
  useEffect(() => {
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

  if (!isOpen) return null;

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
      {/* Overlay de fondo semitransparente con transición suave */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        style={{
          opacity: isAnimating ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Contenedor principal que se desliza desde arriba */}
      <div
        ref={containerRef}
        className="fixed left-0 right-0 z-50 md:hidden bg-white shadow-lg transform transition-transform duration-500 ease-out"
        style={{
          top: `${headerBottom}px`,
          bottom: 0,
          transform: isAnimating ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onClick={(e) => e.stopPropagation()} // Prevenir que los clics dentro del contenedor se propaguen
      >
        {/* Botón X para cerrar el menú */}
        <div className="flex justify-end items-center p-4 border-b border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors text-2xl font-bold leading-none p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        {/* Contenedor de las cajas escalonadas */}
        <div className="flex-1 flex flex-col justify-start items-center pt-4 px-4 gap-3 overflow-y-auto pb-8">
          {orderedItems.map((item, index) => {
            const active = isActive(item.href);
            // Cada elemento espera a que el anterior termine su animación
            // Contenedor: 500ms (duration-500), luego cada elemento: 500ms + (index * 100ms delay)
            // El delay del contenedor (10ms) se suma al delay de cada elemento
            const delay = 10 + containerDuration + (index * itemDelay); // Escalonado progresivo (0.5s más rápido)
            const boxWidth = getBoxWidth(index, orderedItems.length);

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="block w-full"
                style={{
                  width: boxWidth,
                  maxWidth: '90%',
                  overflow: 'hidden', // Para el efecto de cortina
                }}
                aria-label={`Navegar a ${item.label}`}
              >
                {/* Contenedor interno para el efecto de cortina (se expande desde el centro) */}
                <div
                  style={{
                    transform: isAnimating ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center center', // Se expande desde el centro hacia los lados
                    transition: `transform ${itemDuration}ms ease-out`,
                    transitionDelay: `${delay}ms`,
                    willChange: 'transform',
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
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

