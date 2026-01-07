/**
 * Investment CTA Section Component
 * 
 * Componente wrapper que maneja el CTA y el modal de seguros.
 * Permite que el botón "Verify Insurance Coverage" abra el modal.
 */

import { useState } from 'react';
import InvestmentCTA from './InvestmentCTA';
import InsuranceModal from './InsuranceModal';
import type { LocalizedText } from '@/data/models/ContentPage';

interface InvestmentCTASectionProps {
  title: LocalizedText;
  subtitle?: LocalizedText;
  primaryCTA: {
    text: LocalizedText;
    href?: string;
  };
  secondaryCTA?: {
    text: LocalizedText;
    href?: string;
  };
  language: 'en' | 'es';
  // Props para el modal de seguros
  insuranceModal?: {
    providerList: string[];
    title?: LocalizedText;
    description?: LocalizedText;
    outOfNetworkInfo?: LocalizedText;
    note?: LocalizedText;
  };
}

export default function InvestmentCTASection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  language,
  insuranceModal,
}: InvestmentCTASectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Si hay modal de seguros y el secondaryCTA es "Verify Insurance Coverage",
  // hacer que abra el modal en lugar de ir a /contact
  const handleSecondaryClick = () => {
    if (insuranceModal && secondaryCTA) {
      const secondaryText = language === 'en' 
        ? secondaryCTA.text.en || secondaryCTA.text.es
        : secondaryCTA.text.es || secondaryCTA.text.en;
      
      // Verificar si el texto es sobre verificar cobertura de seguro
      if (secondaryText.toLowerCase().includes('verify') && 
          secondaryText.toLowerCase().includes('insurance')) {
        setIsModalOpen(true);
        return;
      }
    }
    
    // Si no, usar el href normal
    if (secondaryCTA?.href) {
      window.location.href = secondaryCTA.href;
    }
  };

  // Modificar secondaryCTA para incluir onClick
  const modifiedSecondaryCTA = secondaryCTA ? {
    ...secondaryCTA,
    onClick: handleSecondaryClick,
  } : undefined;

  return (
    <>
      <InvestmentCTA
        title={title}
        subtitle={subtitle}
        primaryCTA={primaryCTA}
        secondaryCTA={modifiedSecondaryCTA}
        language={language}
      />
      
      {insuranceModal && (
        <InsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          providers={insuranceModal.providerList}
          language={language}
          title={insuranceModal.title}
          description={insuranceModal.description}
          outOfNetworkInfo={insuranceModal.outOfNetworkInfo}
          note={insuranceModal.note}
        />
      )}
    </>
  );
}
