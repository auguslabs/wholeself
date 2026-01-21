/**
 * Rates FAQ Component
 * 
 * Componente de preguntas frecuentes usando Accordion para la página de Rates.
 */

import { Accordion } from '@/components/ui/Accordion';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

interface FAQQuestion {
  question: LocalizedText;
  answer: LocalizedText;
}

interface RatesFAQProps {
  questions: FAQQuestion[];
  language: 'en' | 'es';
  title?: LocalizedText;
}

export default function RatesFAQ({ questions, language, title }: RatesFAQProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const accordionItems = questions.map((faq, index) => ({
    id: `faq-${index}`,
    title: getLocalizedText(faq.question, language),
    content: (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {getLocalizedText(faq.answer, language)}
        </p>
      </div>
    ),
    icon: <QuestionMarkCircleIcon className="w-6 h-6 text-blueGreen-500" />,
    defaultOpen: index === 0,
  }));

  return (
    <section id="rates-faq" className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        {title && (
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">
            {getLocalizedText(title, language)}
          </h2>
        )}
        <Accordion items={accordionItems} allowMultiple={true} />
      </div>
    </section>
  );
}
