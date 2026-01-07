/**
 * FAQ Accordion Component
 * 
 * Componente de acordeón para preguntas frecuentes
 */

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  paragraphs?: string[];
  isSource?: boolean;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-navy-900 pr-4">
                {item.question}
              </h3>
              <ChevronDownIcon
                className={`w-6 h-6 text-navy-600 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-gray-700 leading-relaxed">
                  {item.paragraphs ? (
                    <div className="space-y-2">
                      {item.paragraphs.map((paragraph, idx) => {
                        if (item.isSource && idx === item.paragraphs!.length - 1) {
                          const sourceMatch = paragraph.match(/Source: (.+)/);
                          const mainText = paragraph.split('Source:')[0];
                          return (
                            <p key={idx} className="text-sm text-gray-600 italic">
                              {mainText.includes('75.4%') ? (
                                <>
                                  {mainText.split('75.4%')[0]}
                                  <strong className="text-navy-900">75.4%</strong>
                                  {mainText.split('75.4%')[1]}
                                  <br />
                                  <span>
                                    Source: {sourceMatch && sourceMatch[1].includes('https://') ? (
                                      <>
                                        {sourceMatch[1].split('https://')[0]}
                                        <a 
                                          href={`https://${sourceMatch[1].split('https://')[1]}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-navy-600 hover:text-navy-700 underline"
                                        >
                                          {sourceMatch[1].split('https://')[1]}
                                        </a>
                                      </>
                                    ) : (
                                      sourceMatch?.[1]
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {mainText}
                                  {sourceMatch && (
                                    <>
                                      <br />
                                      <span>
                                        Source: {sourceMatch[1].includes('https://') ? (
                                          <>
                                            {sourceMatch[1].split('https://')[0]}
                                            <a 
                                              href={`https://${sourceMatch[1].split('https://')[1]}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-navy-600 hover:text-navy-700 underline"
                                            >
                                              {sourceMatch[1].split('https://')[1]}
                                            </a>
                                          </>
                                        ) : (
                                          sourceMatch[1]
                                        )}
                                      </span>
                                    </>
                                  )}
                                </>
                              )}
                            </p>
                          );
                        }
                        return (
                          <p key={idx} className={idx === 0 ? 'mb-2' : ''}>
                            {paragraph.includes('75.4%') ? (
                              <>
                                {paragraph.split('75.4%')[0]}
                                <strong className="text-navy-900">75.4%</strong>
                                {paragraph.split('75.4%')[1]}
                              </>
                            ) : (
                              paragraph
                            )}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{item.answer}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
