import React from 'react';

interface TeamHeroProps {
  className?: string;
  language?: 'en' | 'es';
}

/**
 * Sección Hero con frase principal y placeholder de imagen
 */
export function TeamHero({ className = '', language = 'en' }: TeamHeroProps) {
  const title =
    language === 'es'
      ? 'Humanizando el servicio desde el primer contacto'
      : 'Humanizing the service from the very first contact';
  const placeholderText =
    language === 'es'
      ? 'Imagen principal'
      : 'Hero Image Placeholder';
  const placeholderNote =
    language === 'es'
      ? '(La imagen se agregará aquí)'
      : '(Image will be added here)';
  return (
    <section className={`relative py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Placeholder para imagen hero */}
          <div className="mb-8 md:mb-12">
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-tealBlue-100 to-blueGreen-100 rounded-2xl flex items-center justify-center">
              <p className="text-navy-600 text-sm md:text-base">
                {placeholderText}
                <br />
                <span className="text-xs text-navy-500">{placeholderNote}</span>
              </p>
            </div>
          </div>

          {/* Frase principal */}
          <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-4 leading-tight">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
