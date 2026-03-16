import React, { useState, useEffect } from 'react';
import { HomeEditor } from './HomeEditor';
import { ContactEditor } from './ContactEditor';
import { TeamEditor } from './TeamEditor';
import type { ContentPage } from '@/data/models/ContentPage';
import { getPageContent } from '@/data/services/contentService';

interface ContentEditorProps {
  pageId?: string;
  language?: 'en' | 'es';
}

const EDITOR_PAGE_IDS = ['home', 'contact', 'team'];

/**
 * ContentEditor: carga el contenido desde la API y renderiza el editor correspondiente.
 */
export function ContentEditor(props: ContentEditorProps) {
  const { pageId, language = 'en' } = props;
  const currentPageId = (pageId && EDITOR_PAGE_IDS.includes(pageId) ? pageId : 'home') as 'home' | 'contact' | 'team';

  const [pageData, setPageData] = useState<ContentPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPageContent(currentPageId, language)
      .then((data) => {
        if (!cancelled) {
          setPageData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load content');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentPageId, language]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 text-center mt-8">Error loading content: {error}</p>
        <p className="text-gray-500 text-center mt-2 text-sm">Check that the API is available and PUBLIC_USE_CONTENT_FROM_BD=true.</p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="p-8">
        <p className="text-gray-500 text-center mt-8">No content for "{currentPageId}"</p>
      </div>
    );
  }

  if (currentPageId === 'home') {
    return <HomeEditor homeData={pageData} language={language} key={`editor-home-${language}`} />;
  }
  if (currentPageId === 'contact') {
    return <ContactEditor contactData={pageData} language={language} key={`editor-contact-${language}`} />;
  }
  if (currentPageId === 'team') {
    return <TeamEditor teamData={pageData} language={language} key={`editor-team-${language}`} />;
  }

  return (
    <div className="p-8">
      <p className="text-gray-500 text-center mt-8">Editor for "{currentPageId}" is not yet implemented</p>
    </div>
  );
}
