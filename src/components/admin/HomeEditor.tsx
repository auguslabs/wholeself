import React from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';

/**
 * Props del componente HomeEditor
 */
interface HomeEditorProps {
  homeData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente HomeEditor
 * 
 * Editor de contenido para la página Home
 * Muestra todos los campos editables de forma simple
 */
export function HomeEditor({ homeData, language = 'en' }: HomeEditorProps) {
  if (!homeData || !homeData.content) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error: Invalid home data structure</p>
      </div>
    );
  }

  const content = homeData.content;
  const hero = content.hero;
  const valuePropositions = content.valuePropositions;
  const ctaSection = content.ctaSection;

  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Hero Section</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-lg font-semibold text-gray-900">
                {getLocalizedText(hero.headline, language)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-700">
                {getLocalizedText(hero.description, language)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">{hero.backgroundImage}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Value Propositions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {valuePropositions.items.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-[#07549b] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Icon: {item.icon}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getLocalizedText(item.title, language)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getLocalizedText(item.description, language)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Call to Action Section</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-lg font-semibold text-gray-900">
              {getLocalizedText(ctaSection.title, language)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ctaSection.ctas.map((cta: any) => (
            <div key={cta.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Icon: {cta.icon}</p>
                <p className="text-xs text-gray-500 mb-2">Link: {cta.link}</p>
              </div>
              <h3 className="font-semibold text-[#07549b] mb-2">
                {getLocalizedText(cta.title, language)}
              </h3>
              <p className="text-sm text-gray-600">
                {getLocalizedText(cta.description, language)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
