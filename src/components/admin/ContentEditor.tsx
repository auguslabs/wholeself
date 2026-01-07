import React from 'react';
import { HomeEditor } from './HomeEditor';
import { ContactEditor } from './ContactEditor';
import { TeamEditor } from './TeamEditor';
import type { ContentPage } from '@/data/models/ContentPage';

// Importaciones estáticas de los JSONs (funciona en cliente)
import homeDataRaw from '@/data/content/pages/home.json';
import contactDataRaw from '@/data/content/pages/contact.json';
import teamDataRaw from '@/data/content/pages/team.json';

/**
 * Props del componente ContentEditor
 */
interface ContentEditorProps {
  pageId?: string;
  language?: 'en' | 'es';
}

// Mapa de datos cargados estáticamente
const pageDataMap: Record<string, ContentPage> = {
  home: homeDataRaw as ContentPage,
  contact: contactDataRaw as ContentPage,
  team: teamDataRaw as ContentPage,
};

/**
 * Componente ContentEditor
 * 
 * Renderiza el editor apropiado según la página seleccionada
 */
export function ContentEditor(props: ContentEditorProps) {
  // Extraer pageId y language de props explícitamente
  const { pageId, language = 'en' } = props;
  
  // Debug temporal - mostrar TODOS los props recibidos
  if (typeof window !== 'undefined') {
    console.log('[ContentEditor] ALL props recibidos:', props);
    console.log('[ContentEditor] pageId recibido:', pageId, '-> currentPageId:', pageId || 'home');
  }
  
  // Usar 'home' como valor por defecto solo si no hay pageId
  const currentPageId = pageId || 'home';

  // Cargar datos para la página seleccionada
  const pageData = pageDataMap[currentPageId];
  
  // Renderizar el editor apropiado según la página
  if (currentPageId === 'home' && pageData) {
    return <HomeEditor homeData={pageData} language={language} key={`editor-home-${pageId}`} />;
  }
  
  if (currentPageId === 'contact' && pageData) {
    return <ContactEditor contactData={pageData} language={language} key={`editor-contact-${pageId}`} />;
  }
  
  if (currentPageId === 'team' && pageData) {
    return <TeamEditor teamData={pageData} language={language} key={`editor-team-${pageId}`} />;
  }
  
  // Si no hay datos o no está implementado, mostrar mensaje
  if (!pageData) {
    return (
      <div className="p-8">
        <p className="text-gray-500 text-center mt-8">
          Editor for "{currentPageId}" is not yet implemented
        </p>
        <p className="text-gray-400 text-center mt-2 text-sm">
          This editor will be available in a future update
        </p>
      </div>
    );
  }
  
  // Fallback
  return (
    <div className="p-8">
      <p className="text-gray-500 text-center mt-8">
        Editor for "{currentPageId}" is not yet implemented
      </p>
      <p className="text-gray-400 text-center mt-2 text-sm">
        This editor will be available in a future update
      </p>
    </div>
  );
}
