/**
 * Immigration Evaluation Link Component
 * 
 * Botón destacado para navegar a la página de evaluaciones de inmigración
 */

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { LocalizedText } from '@/data/models/ContentPage';

interface ImmigrationEvaluationLinkProps {
  text: LocalizedText;
  language: 'en' | 'es';
}

export default function ImmigrationEvaluationLink({ text, language }: ImmigrationEvaluationLinkProps) {
  return (
    <div className="py-4 px-4 text-center bg-white">
      <a
        href="/services/immigration-evaluations"
        className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg group"
      >
        <span>{language === 'en' ? text.en : text.es}</span>
        <ArrowRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
}
