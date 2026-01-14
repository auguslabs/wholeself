/**
 * FellowshipContent Component
 * 
 * Componente que muestra el contenido completo del programa de fellowship
 */

import React from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { renderIcon } from '../services/iconHelper';

interface FellowshipContentProps {
  mission: {
    title: LocalizedText;
    content: LocalizedText;
  };
  benefits: {
    title: LocalizedText;
    items: Array<{
      id: string;
      text: LocalizedText;
    }>;
  };
  programDetails: {
    title: LocalizedText;
    commitment: LocalizedText;
    duration: {
      label: LocalizedText;
      value: LocalizedText;
    };
    deadline: {
      label: LocalizedText;
      value: LocalizedText;
    };
  };
  howToApply: {
    title: LocalizedText;
    description: LocalizedText;
    contactEmail: LocalizedText;
    email: string;
    applyLink: {
      text: LocalizedText;
      url: string;
    };
  };
  footnote: LocalizedText;
  language: 'en' | 'es';
}

export default function FellowshipContent({
  mission,
  benefits,
  programDetails,
  howToApply,
  footnote,
  language
}: FellowshipContentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Mission & Vision Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-700 mb-4">
          {getLocalizedText(mission.title, language)}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {getLocalizedText(mission.content, language)}
        </p>
      </section>

      {/* Benefits Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-700 mb-6">
          {getLocalizedText(benefits.title, language)}
        </h2>
        <ul className="space-y-4">
          {benefits.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1 text-brown-600">
                {renderIcon('CheckCircleIcon', 'w-5 h-5')}
              </div>
              <p className="text-gray-700 leading-relaxed">
                {getLocalizedText(item.text, language)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Program Details Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-700 mb-6">
          {getLocalizedText(programDetails.title, language)}
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          {getLocalizedText(programDetails.commitment, language)}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brown-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-brown-900 mb-1">
              {getLocalizedText(programDetails.duration.label, language)}
            </p>
            <p className="text-lg font-bold text-navy-900">
              {getLocalizedText(programDetails.duration.value, language)}
            </p>
          </div>
          <div className="bg-brown-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-brown-900 mb-1">
              {getLocalizedText(programDetails.deadline.label, language)}
            </p>
            <p className="text-lg font-bold text-navy-900">
              {getLocalizedText(programDetails.deadline.value, language)}
            </p>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="bg-brown-600 rounded-lg p-8 shadow-sm text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {getLocalizedText(howToApply.title, language)}
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          {getLocalizedText(howToApply.description, language)}
        </p>
        <div className="space-y-4">
          <p className="text-white/90">
            {getLocalizedText(howToApply.contactEmail, language)}{' '}
            <a 
              href={`mailto:${howToApply.email}`}
              className="font-semibold text-white underline hover:text-white/80 transition-colors"
            >
              {howToApply.email}
            </a>
          </p>
          <a
            href={howToApply.applyLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-tealBlue-400 text-white font-bold px-8 py-3 rounded-lg hover:bg-tealBlue-500 transition-colors text-center"
          >
            {getLocalizedText(howToApply.applyLink.text, language)}
          </a>
        </div>
      </section>

      {/* Footnote */}
      <p className="text-sm text-gray-600 text-center italic">
        {getLocalizedText(footnote, language)}
      </p>
    </div>
  );
}
