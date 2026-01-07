/**
 * Investment FAQ Component
 * 
 * Componente de preguntas frecuentes usando Accordion.
 */

import { Accordion } from '@/components/ui/Accordion';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { LocalizedText } from '@/data/models/ContentPage';

interface FAQQuestion {
  question: LocalizedText;
  answer: LocalizedText;
}

interface InvestmentFAQProps {
  questions: FAQQuestion[];
  language: 'en' | 'es';
  title?: LocalizedText;
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function InvestmentFAQ({ questions, language, title }: InvestmentFAQProps) {
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
    <section id="investment-faq" className="py-12 px-4 bg-gray-50">
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
