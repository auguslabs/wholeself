/**
 * Insurance Modal Component
 * 
 * Modal que muestra todos los seguros aceptados en orden alfabético.
 * Incluye espacio para logos de seguros (si están disponibles).
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { LocalizedText } from '@/data/models/ContentPage';

interface InsuranceProvider {
  name: string;
  logo?: string; // Path a la imagen del logo (ej: "/logos/aetna.svg")
}

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: string[]; // Lista de nombres de seguros
  language: 'en' | 'es';
  title?: LocalizedText;
  description?: LocalizedText;
  outOfNetworkInfo?: LocalizedText;
  note?: LocalizedText;
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function InsuranceModal({
  isOpen,
  onClose,
  providers,
  language,
  title,
  description,
  outOfNetworkInfo,
  note,
}: InsuranceModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Ordenar proveedores alfabéticamente
  const sortedProviders = [...providers].sort((a, b) => a.localeCompare(b));

  // Manejar animación y scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Función para obtener el path del logo (si existe)
  const getLogoPath = (providerName: string): string | null => {
    // Normalizar el nombre para buscar el logo
    // Mapeo especial para nombres que necesitan normalización específica
    const nameMap: Record<string, string> = {
      'aetna': 'aetna',
      'ambetter': 'ambetter',
      'blue cross blue shield': 'blue-cross-blue-shield',
      'cigna and evernorth': 'cigna-evernorth',
      'magellan': 'magellan',
      'medicare': 'medicare',
      'mines and associates': 'mines-associates',
      'new mexico medicaid': 'new-mexico-medicaid',
      'new mexico medical insurance pool': 'new-mexico-medical-insurance-pool',
      'optum': 'optum',
      'presbyterian': 'presbyterian',
      'tricare': 'tricare',
      'united healthcare': 'united-healthcare',
    };

    const lowerName = providerName.toLowerCase();
    const normalizedName = nameMap[lowerName] || lowerName
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Retornar el path del logo - intentará cargar SVG primero
    // Si no existe, el onError en el componente manejará el fallback
    return `/logos/insurance/${normalizedName}.svg`;
  };

  // Renderizar el modal usando Portal directamente en el body
  // Esto evita problemas de stacking context en iOS 13+ (Safari)
  // Especialmente importante para iPhone 13+ donde Safari maneja los stacking contexts de manera diferente
  if (!isOpen || typeof window === 'undefined') return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
        style={{
          opacity: isAnimating ? 1 : 0,
        }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insurance-modal-title"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto transform transition-all duration-300"
          style={{
            transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
            opacity: isAnimating ? 1 : 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blueGreen-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blueGreen-500 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                {title && (
                  <h2
                    id="insurance-modal-title"
                    className="text-2xl font-bold text-navy-900"
                  >
                    {getLocalizedText(title, language)}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {getLocalizedText(description, language)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label={language === 'es' ? 'Cerrar' : 'Close'}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Grid de seguros */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {sortedProviders.map((provider, index) => {
                const logoPath = getLogoPath(provider);
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blueGreen-300 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[100px]"
                  >
                    <div className="relative w-full flex flex-col items-center">
                      <img
                        src={logoPath || ''}
                        alt={provider}
                        className="max-h-12 max-w-full object-contain mb-2"
                        style={{ display: 'block' }}
                        onError={(e) => {
                          // Si el logo no carga, ocultar la imagen y mostrar el nombre
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'block';
                          }
                        }}
                        onLoad={(e) => {
                          // Si el logo carga correctamente, ocultar el fallback
                          const img = e.currentTarget;
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'none';
                          }
                        }}
                      />
                      <span 
                        className="text-sm font-medium text-gray-700 text-center"
                        style={{ display: 'none' }}
                      >
                        {provider}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Información adicional */}
            {outOfNetworkInfo && (
              <div className="bg-blueGreen-50 rounded-lg p-4 mb-4 border-l-4 border-blueGreen-500">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getLocalizedText(outOfNetworkInfo, language)}
                </p>
              </div>
            )}

            {note && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                <p className="text-sm text-gray-600 italic">
                  {getLocalizedText(note, language)}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-blueGreen-600 text-white font-semibold py-3 rounded-lg hover:bg-blueGreen-700 transition-colors"
            >
              {language === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Usar createPortal para renderizar directamente en el body
  // Esto asegura que el modal esté en el nivel más alto del DOM
  // y no esté afectado por stacking contexts de elementos padres
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
