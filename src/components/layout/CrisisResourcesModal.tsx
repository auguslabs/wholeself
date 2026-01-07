// Importar React para usar componentes funcionales
import React, { useEffect, useState } from 'react';
import { getPageContent, getLocalizedText } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import {
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  LinkIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Componente CrisisResourcesModal - Layout
 * 
 * Modal de recursos de crisis que se desliza desde abajo.
 * Ocupa toda la pantalla con fondo navy semitransparente.
 * Contenido cargado desde crisis-resources.json
 * 
 * Estructura Desktop:
 * - Fila 1: 4 botones (primera categoría)
 * - Fila 2: Separador de 5px
 * - Fila 3: Contenido principal (contenedor blanco con padding de 5px)
 * - Fila 4: Separador de 5px
 * - Fila 5: 4 botones (segunda categoría)
 */
interface CrisisResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'es';
}

interface Subcategory {
  id: string;
  title: any;
  resources?: any[];
}

export function CrisisResourcesModal({ isOpen, onClose, language = 'en' }: CrisisResourcesModalProps) {
  // Estado para manejar la animación de salida
  const [isAnimating, setIsAnimating] = useState(false);
  // Estado para los datos del JSON
  const [crisisData, setCrisisData] = useState<ContentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Estado para la subcategoría seleccionada
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  // Cargar datos del JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPageContent('crisis-resources');
        setCrisisData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading crisis resources:', error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      // Pequeño delay para activar la animación
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
      // Resetear selección al cerrar
      setSelectedSubcategory(null);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || isLoading || !crisisData) return null;

  const content = crisisData.content;
  const hero = content.hero;
  const categories = content.categories || [];

  // Extraer las 8 subcategorías
  // Primera categoría: General & Community Support (4 subcategorías)
  const firstCategory = categories.find((cat: any) => cat.id === 'general-community');
  const firstRowSubcategories: Subcategory[] = firstCategory?.subcategories || [];

  // Segunda categoría: Specialized Support (tomar las primeras 4 subcategorías)
  const secondCategory = categories.find((cat: any) => cat.id === 'specialized');
  const secondRowSubcategories: Subcategory[] = secondCategory?.subcategories?.slice(0, 4) || [];

  // Función para determinar qué columna está activa (0-3) y de qué fila viene
  const getActiveColumnInfo = (): { column: number | null; fromFirstRow: boolean } => {
    if (!selectedSubcategory) return { column: null, fromFirstRow: false };
    
    // Buscar en la primera fila
    const firstRowIndex = firstRowSubcategories.findIndex(
      (sub) => sub.id === selectedSubcategory.id
    );
    if (firstRowIndex !== -1) return { column: firstRowIndex, fromFirstRow: true };
    
    // Buscar en la segunda fila
    const secondRowIndex = secondRowSubcategories.findIndex(
      (sub) => sub.id === selectedSubcategory.id
    );
    if (secondRowIndex !== -1) return { column: secondRowIndex, fromFirstRow: false };
    
    return { column: null, fromFirstRow: false };
  };

  const { column: activeColumn, fromFirstRow } = getActiveColumnInfo();
  
  // Determinar qué filas separadoras deben activarse
  // Para la primera fila (grid 2x2), necesitamos activar el separador correcto según la columna
  const shouldActivateRow2 = activeColumn !== null && fromFirstRow;
  const shouldActivateRow4 = activeColumn !== null && !fromFirstRow;

  // Función para truncar URLs mostrando solo la parte relevante
  const truncateUrl = (url: string): string => {
    // Remover protocolo si existe
    let cleanUrl = url.replace(/^https?:\/\//, '');
    
    // Dividir el URL en partes
    const parts = cleanUrl.split('/');
    const domain = parts[0];
    
    // Si hay una ruta, intentar mostrar dominio + primera parte de la ruta
    if (parts.length > 1) {
      const firstPath = parts[1];
      // Si la primera parte es "resources" o similar, mostrar hasta ahí
      if (firstPath && (firstPath.includes('resource') || firstPath.length <= 20)) {
        const truncated = `${domain}/${firstPath}`;
        // Si es razonablemente corto, mostrarlo completo
        if (truncated.length <= 50) {
          return truncated;
        }
      }
      // Si no, solo mostrar dominio + primera parte truncada
      const truncated = `${domain}/${firstPath.substring(0, 15)}...`;
      return truncated.length <= 50 ? truncated : domain + '...';
    }
    
    // Si solo es el dominio y es muy largo, truncarlo
    if (domain.length > 40) {
      return domain.substring(0, 37) + '...';
    }
    
    return cleanUrl;
  };

  // Función para renderizar recursos
  // Si viene de la primera fila (general-community), usar grid 2x2 en desktop
  const renderResources = (resources: any[], useGrid: boolean = false) => {
    if (useGrid) {
      // Grid 2x2 para desktop, lista vertical para móvil
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource: any, index: number) => (
            <div key={index} className="border border-navy-300 rounded-lg p-4 bg-white overflow-x-hidden">
            <strong className="text-blueGreen-500 text-lg md:text-xl block mb-2 font-bold">
              {getLocalizedText(resource.name, language)}
            </strong>
            {resource.description && (
              <p className="text-navy-800 mb-3 break-words">
                {getLocalizedText(resource.description, language)}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 overflow-x-hidden w-full">
              {resource.phone && (
                <a 
                  href={`tel:${resource.phone.replace(/[^\d]/g, '')}`}
                  className="text-navy-900 hover:text-navy-700 underline font-semibold flex items-center gap-1.5"
                >
                  <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{resource.phone}</span>
                </a>
              )}
              {resource.text && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Texto:' : 'Text:'} {resource.text}</span>
                </span>
              )}
              {resource.url && (
                <a
                  href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 hover:text-navy-700 underline break-words max-w-full flex items-center gap-1.5"
                  title={resource.url}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                >
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{truncateUrl(resource.url)}</span>
                </a>
              )}
              {resource.videoPhone && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <VideoCameraIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Videoteléfono:' : 'Video Phone:'} {resource.videoPhone}</span>
                </span>
              )}
              {resource.instantMessenger && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Mensajería:' : 'IM:'} {resource.instantMessenger}</span>
                </span>
              )}
              {resource.email && (
                <a
                  href={`mailto:${resource.email}`}
                  className="text-navy-900 hover:text-navy-700 underline flex items-center gap-1.5"
                >
                  <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{resource.email}</span>
                </a>
              )}
              {resource.tty && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                  <span>TTY: {resource.tty}</span>
                </span>
              )}
            </div>
            {resource.hours && (
              <div className="text-sm text-navy-700 mt-2 italic flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 flex-shrink-0" />
                <span>{typeof resource.hours === 'object' ? getLocalizedText(resource.hours, language) : resource.hours}</span>
              </div>
            )}
            </div>
          ))}
        </div>
      );
    }
    
    // Lista vertical tradicional (para specialized y móvil)
    return (
      <ul className="space-y-4 text-base md:text-lg overflow-x-hidden">
        {resources.map((resource: any, index: number) => (
          <li key={index} className="border-b border-navy-300 pb-4 last:border-b-0 overflow-x-hidden">
            <strong className="text-blueGreen-500 text-lg md:text-xl block mb-2 font-bold">
              {getLocalizedText(resource.name, language)}
            </strong>
            {resource.description && (
              <p className="text-navy-800 mb-3 break-words">
                {getLocalizedText(resource.description, language)}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 overflow-x-hidden w-full">
              {resource.phone && (
                <a 
                  href={`tel:${resource.phone.replace(/[^\d]/g, '')}`}
                  className="text-navy-900 hover:text-navy-700 underline font-semibold flex items-center gap-1.5"
                >
                  <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{resource.phone}</span>
                </a>
              )}
              {resource.text && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Texto:' : 'Text:'} {resource.text}</span>
                </span>
              )}
              {resource.url && (
                <a
                  href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 hover:text-navy-700 underline break-words max-w-full flex items-center gap-1.5"
                  title={resource.url}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                >
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{truncateUrl(resource.url)}</span>
                </a>
              )}
              {resource.videoPhone && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <VideoCameraIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Videoteléfono:' : 'Video Phone:'} {resource.videoPhone}</span>
                </span>
              )}
              {resource.instantMessenger && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{language === 'es' ? 'Mensajería:' : 'IM:'} {resource.instantMessenger}</span>
                </span>
              )}
              {resource.email && (
                <a
                  href={`mailto:${resource.email}`}
                  className="text-navy-900 hover:text-navy-700 underline flex items-center gap-1.5"
                >
                  <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{resource.email}</span>
                </a>
              )}
              {resource.tty && (
                <span className="text-navy-900 flex items-center gap-1.5">
                  <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                  <span>TTY: {resource.tty}</span>
                </span>
              )}
            </div>
            {resource.hours && (
              <div className="text-sm text-navy-700 mt-2 italic flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 flex-shrink-0" />
                <span>{typeof resource.hours === 'object' ? getLocalizedText(resource.hours, language) : resource.hours}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {/* Backdrop semitransparente con blur */}
      <div
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal que se desliza desde abajo */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-modal-title"
      >
        <div
          className="w-full h-full bg-navy-500/95 backdrop-blur-md overflow-y-auto pointer-events-auto transform transition-transform duration-500 ease-out"
          style={{
            transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Contenedor principal con estructura de 5 filas - Desktop */}
          <div className="h-full flex flex-col">
            {/* Header del modal con botón de cierre - Solo visible en mobile */}
            <div className="lg:hidden flex justify-between items-start p-4 sm:p-6">
              <h2
                id="crisis-modal-title"
                className="text-2xl sm:text-3xl font-bold text-white"
              >
                {getLocalizedText(hero.title, language)}
              </h2>
              <div className="flex items-center gap-4">
                <a
                  href="https://alvordbaker.sessionshealth.com/clients/sign_in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-navy-200 transition-colors text-sm font-medium underline"
                >
                  Client Portal
                </a>
                <button
                  onClick={onClose}
                  className="text-white hover:text-navy-200 transition-colors text-3xl font-bold leading-none p-2"
                  aria-label={language === 'es' ? 'Cerrar recursos de crisis' : 'Close crisis resources'}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Layout Desktop: Grid de 5 filas */}
            <div className="hidden lg:flex lg:flex-col h-full p-5 gap-0">
              {/* Header Desktop con botón de cierre */}
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="crisis-modal-title"
                  className="text-3xl font-bold text-white"
                >
                  {getLocalizedText(hero.title, language)}
                </h2>
                <div className="flex items-center gap-4">
                  <a
                    href="https://alvordbaker.sessionshealth.com/clients/sign_in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-navy-200 transition-colors text-sm font-medium underline"
                  >
                    Client Portal
                  </a>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-navy-200 transition-colors text-3xl font-bold leading-none p-2"
                    aria-label={language === 'es' ? 'Cerrar recursos de crisis' : 'Close crisis resources'}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Fila 1: 4 botones (primera categoría) */}
              <div className="flex justify-between gap-4 mb-0">
                {firstRowSubcategories.map((subcategory, index) => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`flex-1 px-4 py-6 text-center font-bold text-lg transition-all duration-300 rounded-lg ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'bg-blueGreen-500 text-white shadow-lg scale-105 ring-2 ring-blueGreen-300'
                        : 'bg-navy-400/80 text-white hover:bg-navy-300 hover:text-navy-900 hover:scale-105'
                    }`}
                  >
                    {getLocalizedText(subcategory.title, language)}
                  </button>
                ))}
              </div>

              {/* Fila 2: Separador de 5px con ruta visual - Solo se activa si viene de la fila 1 */}
              <div className="flex justify-between gap-4 h-[5px] my-0">
                {[0, 1, 2, 3].map((colIndex) => (
                  <div
                    key={colIndex}
                    className={`flex-1 h-full transition-all duration-300 ${
                      shouldActivateRow2 && activeColumn === colIndex
                        ? 'bg-blueGreen-500'
                        : 'bg-navy-400/50'
                    }`}
                  />
                ))}
              </div>

              {/* Fila 3: Contenido principal */}
              <div className="relative flex-1 min-h-0 my-0">
                <div className="absolute inset-0 bg-white rounded-lg p-5 overflow-y-auto overflow-x-hidden">
                  {selectedSubcategory ? (
                    <div className="overflow-x-hidden">
                      <h3 className="text-2xl font-bold text-navy-900 mb-6">
                        {getLocalizedText(selectedSubcategory.title, language)}
                      </h3>
                      {selectedSubcategory.resources && selectedSubcategory.resources.length > 0 ? (
                        renderResources(selectedSubcategory.resources, true)
                      ) : (
                        <p className="text-navy-700">
                          {language === 'es' ? 'No hay recursos disponibles.' : 'No resources available.'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-navy-700 text-xl text-center">
                        {language === 'es' 
                          ? 'Selecciona una categoría para ver los recursos disponibles.' 
                          : 'Select a category to view available resources.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila 4: Separador de 5px con ruta visual - Solo se activa si viene de la fila 5 */}
              <div className="flex justify-between gap-4 h-[5px] my-0">
                {[0, 1, 2, 3].map((colIndex) => (
                  <div
                    key={colIndex}
                    className={`flex-1 h-full transition-all duration-300 ${
                      shouldActivateRow4 && activeColumn === colIndex
                        ? 'bg-blueGreen-500'
                        : 'bg-navy-400/50'
                    }`}
                  />
                ))}
              </div>

              {/* Fila 5: 4 botones (segunda categoría) */}
              <div className="flex justify-between gap-4 mt-0">
                {secondRowSubcategories.map((subcategory, index) => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`flex-1 px-4 py-6 text-center font-bold text-lg transition-all duration-300 rounded-lg ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'bg-blueGreen-500 text-white shadow-lg scale-105 ring-2 ring-blueGreen-300'
                        : 'bg-navy-400/80 text-white hover:bg-navy-300 hover:text-navy-900 hover:scale-105'
                    }`}
                  >
                    {getLocalizedText(subcategory.title, language)}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mobile: Diseño alternativo */}
            <div className="lg:hidden flex flex-col h-full">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6">
                {/* Botones de categorías en mobile - diseño de acordeón */}
                <div className="space-y-4 mb-6">
                  {/* Primera categoría */}
                  <div>
                    <h3 className="text-xl font-bold text-navy-200 mb-3">
                      {firstCategory ? getLocalizedText(firstCategory.title, language) : ''}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {firstRowSubcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => setSelectedSubcategory(
                            selectedSubcategory?.id === subcategory.id ? null : subcategory
                          )}
                          className={`px-4 py-4 text-center font-semibold text-sm transition-all duration-300 rounded-lg ${
                            selectedSubcategory?.id === subcategory.id
                              ? 'bg-blueGreen-500 text-white shadow-lg scale-105 ring-2 ring-blueGreen-300'
                              : 'bg-navy-400/80 text-white hover:bg-navy-300 hover:text-navy-900'
                          }`}
                        >
                          {getLocalizedText(subcategory.title, language)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Segunda categoría */}
                  <div>
                    <h3 className="text-xl font-bold text-navy-200 mb-3">
                      {secondCategory ? getLocalizedText(secondCategory.title, language) : ''}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {secondRowSubcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => setSelectedSubcategory(
                            selectedSubcategory?.id === subcategory.id ? null : subcategory
                          )}
                          className={`px-4 py-4 text-center font-semibold text-sm transition-all duration-300 rounded-lg ${
                            selectedSubcategory?.id === subcategory.id
                              ? 'bg-blueGreen-500 text-white shadow-lg scale-105 ring-2 ring-blueGreen-300'
                              : 'bg-navy-400/80 text-white hover:bg-navy-300 hover:text-navy-900'
                          }`}
                        >
                          {getLocalizedText(subcategory.title, language)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenido seleccionado en mobile */}
                {selectedSubcategory && (
                  <div className="bg-white rounded-lg p-6 mt-4 overflow-x-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-navy-900">
                        {getLocalizedText(selectedSubcategory.title, language)}
                      </h3>
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className="text-navy-700 hover:text-navy-900 text-2xl font-bold leading-none"
                        aria-label={language === 'es' ? 'Cerrar' : 'Close'}
                      >
                        ×
                      </button>
                    </div>
                    {selectedSubcategory.resources && selectedSubcategory.resources.length > 0 ? (
                      renderResources(selectedSubcategory.resources, true)
                    ) : (
                      <p className="text-navy-700">
                        {language === 'es' ? 'No hay recursos disponibles.' : 'No resources available.'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de cierre en mobile */}
              <div className="p-4 border-t border-navy-400/50">
                <button
                  onClick={onClose}
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {language === 'es' ? 'Cerrar' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

