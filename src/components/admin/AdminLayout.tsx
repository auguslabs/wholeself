import React, { useState, useEffect } from 'react';
import { EasyToChangeLogo } from './EasyToChangeLogo';
import { ProjectHeader } from './ProjectHeader';
import { PageNavigation, type Page } from './PageNavigation';
import { ContentEditor } from './ContentEditor';

/**
 * Props del componente AdminLayout
 */
interface AdminLayoutProps {
  projectName: string;
  projectSubtitle?: string;
  pages: Page[];
  children?: React.ReactNode;
  onPageSelect?: (pageId: string) => void;
  activePageId?: string;
  language?: 'en' | 'es';
}

/**
 * Componente AdminLayout
 * 
 * Layout principal del panel de administración con estructura 2x2:
 * - Fila 1: Logo (1/5) | Nombre del Proyecto (4/5)
 * - Fila 2: Navegación de Páginas (1/5) | Área de Contenido (4/5)
 */
export function AdminLayout({
  projectName,
  projectSubtitle,
  pages,
  children,
  onPageSelect,
  activePageId,
  language = 'en'
}: AdminLayoutProps) {
  const [selectedPage, setSelectedPage] = useState<string>(activePageId || 'home');

  // Sincronizar el estado cuando cambia activePageId desde las props
  useEffect(() => {
    if (activePageId) {
      setSelectedPage(activePageId);
    }
  }, [activePageId]);

  const handlePageSelect = (pageId: string) => {
    if (typeof window !== 'undefined') {
      console.log('[AdminLayout] handlePageSelect called with:', pageId);
    }
    setSelectedPage(pageId);
    onPageSelect?.(pageId);
    if (typeof window !== 'undefined') {
      console.log('[AdminLayout] selectedPage state updated to:', pageId);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Primera Fila: Logo + Nombre del Proyecto */}
      <div className="flex border-b border-gray-200 bg-white">
        {/* Columna 1: Logo (1/5) */}
        <div className="w-1/5">
          <EasyToChangeLogo 
            onClick={() => {
              // TODO: Navegar a dashboard principal cuando haya múltiples proyectos
              console.log('Navigate to main dashboard');
            }}
          />
        </div>
        
        {/* Columna 2: Nombre del Proyecto (4/5) */}
        <div className="w-4/5 overflow-x-auto">
          <ProjectHeader 
            projectName={projectName}
            projectSubtitle={projectSubtitle}
          />
        </div>
      </div>

      {/* Segunda Fila: Navegación + Contenido */}
      {/* Desktop: lado a lado, Móvil: apilado (navegación arriba) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Columna 1: Navegación de Páginas (1/5 en desktop, full width en móvil) */}
        <div className="w-full md:w-1/5 border-b md:border-b-0 md:border-r border-gray-200">
          <PageNavigation
            pages={pages}
            activePageId={selectedPage}
            onPageSelect={handlePageSelect}
          />
        </div>
        
        {/* Columna 2: Área de Contenido (4/5 en desktop, full width en móvil) */}
        <div className="w-full md:w-4/5 overflow-y-auto overflow-x-auto bg-white">
          <ContentEditor 
            pageId={selectedPage}
            language={language}
            key={`content-editor-${selectedPage}`}
          />
        </div>
      </div>
    </div>
  );
}
