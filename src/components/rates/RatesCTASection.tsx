/**
 * Rates CTA Section Component
 * 
 * Componente wrapper que maneja el CTA y el modal de seguros.
 * Permite que el botón "Verify Insurance Coverage" abra el modal.
 */

import { useState } from 'react';
import RatesCTA from './RatesCTA';
import InsuranceModal from './InsuranceModal';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { withLocalePath } from '@/utils/i18n';

interface RatesCTASectionProps {
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

export default function RatesCTASection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  language,
  insuranceModal,
}: RatesCTASectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Si hay modal de seguros y el secondaryCTA es "Verify Insurance Coverage",
  // hacer que abra el modal en lugar de ir a /contact
  const handleSecondaryClick = () => {
    if (insuranceModal && secondaryCTA) {
      const secondaryText = getLocalizedText(secondaryCTA.text, language);
      
      // Verificar si el texto es sobre verificar cobertura de seguro
      if (secondaryText.toLowerCase().includes('verify') && 
          secondaryText.toLowerCase().includes('insurance')) {
        setIsModalOpen(true);
        return;
      }
    }
    
    // Si no, usar el href normal
    if (secondaryCTA?.href) {
      window.location.href = withLocalePath(secondaryCTA.href, language);
    }
  };

  // Modificar secondaryCTA para incluir onClick
  const modifiedSecondaryCTA = secondaryCTA ? {
    ...secondaryCTA,
    onClick: handleSecondaryClick,
  } : undefined;

  return (
    <>
      <RatesCTA
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
