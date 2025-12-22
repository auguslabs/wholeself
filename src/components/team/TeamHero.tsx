import React from 'react';

interface TeamHeroProps {
  className?: string;
}

/**
 * Sección Hero con frase principal y placeholder de imagen
 */
export function TeamHero({ className = '' }: TeamHeroProps) {
  return (
    <section className={`relative py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Placeholder para imagen hero */}
          <div className="mb-8 md:mb-12">
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-tealBlue-100 to-blueGreen-100 rounded-2xl flex items-center justify-center">
              <p className="text-navy-600 text-sm md:text-base">
                Hero Image Placeholder
                <br />
                <span className="text-xs text-navy-500">(Image will be added here)</span>
              </p>
            </div>
          </div>

          {/* Frase principal */}
          <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-4 leading-tight">
            Humanizing the service from the very first contact
          </h1>
        </div>
      </div>
    </section>
  );
}
