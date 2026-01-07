import React from 'react';

/**
 * Props del componente EasyToChangeLogo
 */
interface EasyToChangeLogoProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Componente EasyToChangeLogo
 * 
 * Logo del panel de administración "Easy to Change"
 * Muestra el logo a color completo
 */
export function EasyToChangeLogo({ className = '', onClick }: EasyToChangeLogoProps) {
  return (
    <div 
      className={`flex items-center justify-center p-4 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
      title="Easy to Change - Administration Panel"
    >
      {/* Logo móvil - visible solo en móvil */}
      <img 
        src="/etocha/images/easytochange-logo-mobil.webp" 
        alt="Easy to Change" 
        className="w-14 h-14 md:hidden"
      />
      {/* Logo desktop - visible solo en desktop, 50% más grande que el anterior (84px * 1.5 = 126px) */}
      <img 
        src="/etocha/images/easytochange-logo-desktop.webp" 
        alt="Easy to Change" 
        className="hidden md:block w-[126px] h-auto"
      />
    </div>
  );
}
