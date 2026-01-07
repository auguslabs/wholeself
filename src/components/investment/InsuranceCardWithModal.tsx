/**
 * Insurance Card with Modal Component
 * 
 * Card de seguros que incluye un botón para abrir un modal con la lista completa.
 */

import { useState } from 'react';
import InvestmentCard from './InvestmentCard';
import InsuranceModal from './InsuranceModal';
import type { LocalizedText } from '@/data/models/ContentPage';

interface InsuranceCardWithModalProps {
  title: LocalizedText;
  description?: LocalizedText;
  icon: string;
  language: 'en' | 'es';
  items?: Array<{
    label?: LocalizedText;
    text: LocalizedText;
  }>;
  providerList?: string[];
  modal?: {
    title?: LocalizedText;
    description?: LocalizedText;
    outOfNetworkInfo?: LocalizedText;
    note?: LocalizedText;
  };
  colorClass?: string;
}

export default function InsuranceCardWithModal({
  title,
  description,
  icon,
  language,
  items,
  providerList = [],
  modal,
  colorClass = 'border-blueGreen-500',
}: InsuranceCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Crear un CTA personalizado que abra el modal
  const cta = {
    text: {
      en: 'View All Insurance Providers',
      es: 'Ver Todos los Proveedores de Seguro',
    } as LocalizedText,
    onClick: () => setIsModalOpen(true),
  };

  return (
    <>
      <InvestmentCard
        title={title}
        description={description}
        icon={icon}
        language={language}
        items={items}
        cta={cta}
        colorClass={colorClass}
      />
      
      {providerList.length > 0 && modal && (
        <InsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          providers={providerList}
          language={language}
          title={modal.title}
          description={modal.description}
          outOfNetworkInfo={modal.outOfNetworkInfo}
          note={modal.note}
        />
      )}
    </>
  );
}
