/**
 * Immigration Evaluation Link Component
 * 
 * Botón destacado para navegar a la página de evaluaciones de inmigración
 */

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { withLocalePath } from '@/utils/i18n';

interface ImmigrationEvaluationLinkProps {
  text: LocalizedText;
  language: 'en' | 'es';
}

export default function ImmigrationEvaluationLink({ text, language }: ImmigrationEvaluationLinkProps) {
  return (
    <div className="py-4 px-4 text-center bg-white">
      <a
        href={withLocalePath('/services/immigration-evaluations', language)}
        className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg group"
      >
        <span>{getLocalizedText(text, language)}</span>
        <ArrowRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
}
