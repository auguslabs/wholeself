// Importar React para usar componentes funcionales
import React, { useEffect, useState } from 'react';

/**
 * Componente CrisisResourcesModal - Layout
 * 
 * Modal de recursos de crisis que se desliza desde abajo.
 * Ocupa toda la pantalla con fondo navy semitransparente.
 * Contenido organizado en secciones con información de Albuquerque, NM.
 */
interface CrisisResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisResourcesModal({ isOpen, onClose }: CrisisResourcesModalProps) {
  // Estado para manejar la animación de salida
  const [isAnimating, setIsAnimating] = useState(false);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      // Pequeño delay para activar la animación
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop semitransparente con blur */}
      <div
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal que se desliza desde abajo */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-modal-title"
      >
        <div
          className="w-full h-full bg-navy-500/95 backdrop-blur-md overflow-y-auto pointer-events-auto transform transition-transform duration-500 ease-out"
          style={{
            transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Contenedor del contenido con padding */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header del modal con botón de cierre */}
            <div className="flex justify-between items-start mb-8">
              <h2
                id="crisis-modal-title"
                className="text-3xl sm:text-4xl font-bold text-white"
              >
                Crisis Resources
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-navy-200 transition-colors text-3xl font-bold leading-none p-2"
                aria-label="Cerrar recursos de crisis"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="space-y-8 text-white">
              {/* Section 1: Immediate Crisis Help */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Immediate Crisis Help
                </h3>
                <ul className="space-y-3 text-lg">
                  <li>
                    <strong>National Suicide Prevention Lifeline:</strong>{' '}
                    <a href="tel:988" className="text-navy-200 hover:text-white underline">
                      988
                    </a>
                  </li>
                  <li>
                    <strong>New Mexico Crisis and Access Line:</strong>{' '}
                    <a href="tel:18556627474" className="text-navy-200 hover:text-white underline">
                      1-855-NMCRISIS (1-855-662-7474)
                    </a>{' '}
                    or <a href="tel:988" className="text-navy-200 hover:text-white underline">988</a>
                  </li>
                  <li>
                    <strong>Crisis Text Line:</strong> Text{' '}
                    <strong className="text-navy-200">HOME</strong> to{' '}
                    <a href="sms:741741" className="text-navy-200 hover:text-white underline">
                      741741
                    </a>
                  </li>
                  <li>
                    <strong>911</strong> for immediate emergencies
                  </li>
                  <li>
                    <strong>Agora Crisis Center:</strong>{' '}
                    <a href="tel:5052773013" className="text-navy-200 hover:text-white underline">
                      505-277-3013
                    </a>{' '}
                    or{' '}
                    <a href="tel:18664375166" className="text-navy-200 hover:text-white underline">
                      1-866-HELP-1-NM
                    </a>
                  </li>
                  <li>
                    <strong>Rape Crisis Center of New Mexico:</strong> 24/7 Hotline{' '}
                    <a href="tel:5052667711" className="text-navy-200 hover:text-white underline">
                      505-266-7711
                    </a>
                  </li>
                </ul>
              </section>

              {/* Section 2: 24/7 Crisis Resources */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  24/7 Crisis Resources
                </h3>
                <ul className="space-y-3 text-lg">
                  <li>
                    <strong>New Mexico Crisis and Access Line:</strong> Available 24/7.{' '}
                    Also available via{' '}
                    <a
                      href="https://nmcrisisline.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-200 hover:text-white underline"
                    >
                      NMConnect app
                    </a>
                  </li>
                  <li>
                    <strong>New Mexico Peer Support Warmline:</strong>{' '}
                    <a href="tel:18554667100" className="text-navy-200 hover:text-white underline">
                      1-855-4NM-7100 (1-855-466-7100)
                    </a>{' '}
                    - Talk to someone who has been through similar experiences
                  </li>
                  <li>
                    <strong>Mobile Crisis Teams:</strong> Available through{' '}
                    <a href="tel:988" className="text-navy-200 hover:text-white underline">988</a>{' '}
                    - Provide crisis intervention at your location
                  </li>
                  <li>
                    <strong>Online Crisis Chat Services:</strong> Available through{' '}
                    <a
                      href="https://988lifeline.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-200 hover:text-white underline"
                    >
                      988lifeline.org
                    </a>
                  </li>
                </ul>
              </section>

              {/* Section 3: When to Seek Immediate Help */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  When to Seek Immediate Help
                </h3>
                <div className="space-y-4 text-lg">
                  <div>
                    <strong className="text-navy-200">Signs that indicate immediate help is needed:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Suicidal thoughts or plans</li>
                      <li>Self-harm behaviors</li>
                      <li>Severe panic attacks or anxiety</li>
                      <li>Psychotic symptoms (hallucinations, delusions)</li>
                      <li>Extreme mood swings or aggression</li>
                      <li>Substance abuse crisis</li>
                      <li>Inability to care for basic needs</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-navy-200">Safety concerns:</strong>
                    <p className="mt-2">
                      If you or someone else is in immediate danger, call{' '}
                      <strong className="text-navy-200">911</strong> immediately.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4: Community Mental Health Resources */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Community Mental Health Resources
                </h3>
                <ul className="space-y-3 text-lg">
                  <li>
                    <strong>UNM Psychiatric Center:</strong> 24-hour emergency line{' '}
                    <a href="tel:5052722920" className="text-navy-200 hover:text-white underline">
                      505-272-2920
                    </a>
                  </li>
                  <li>
                    <strong>Alternatives to Violence:</strong> Domestic violence assistance. 24/7 Hotline{' '}
                    <a href="tel:5754455778" className="text-navy-200 hover:text-white underline">
                      575-445-5778
                    </a>
                  </li>
                  <li>
                    <strong>Local Mental Health Centers:</strong> Contact{' '}
                    <a href="tel:988" className="text-navy-200 hover:text-white underline">988</a>{' '}
                    for referrals to local providers
                  </li>
                  <li>
                    <strong>Support Groups:</strong> Available through local community centers and{' '}
                    <a
                      href="https://namialbuquerque.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-200 hover:text-white underline"
                    >
                      NAMI Albuquerque
                    </a>
                  </li>
                </ul>
              </section>

              {/* Section 5: For Family and Friends */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  For Family and Friends
                </h3>
                <div className="space-y-4 text-lg">
                  <div>
                    <strong className="text-navy-200">How to help someone in crisis:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Listen without judgment</li>
                      <li>Stay calm and offer support</li>
                      <li>Encourage professional help</li>
                      <li>Don't leave the person alone if they're in immediate danger</li>
                      <li>Call 988 or 911 if needed</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-navy-200">Warning signs to watch for:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Expressions of hopelessness or worthlessness</li>
                      <li>Withdrawal from friends and activities</li>
                      <li>Dramatic mood changes</li>
                      <li>Increased substance use</li>
                      <li>Talking about death or suicide</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 6: After a Crisis */}
              <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-white">
                  After a Crisis
                </h3>
                <div className="space-y-3 text-lg">
                  <p>
                    <strong className="text-navy-200">Follow-up care:</strong> It's important to continue
                    with professional mental health support after a crisis. Contact local providers or
                    call 988 for referrals.
                  </p>
                  <p>
                    <strong className="text-navy-200">Ongoing support:</strong> Consider joining support
                    groups, continuing therapy, and maintaining a safety plan.
                  </p>
                  <p>
                    <strong className="text-navy-200">How we can help:</strong> Whole Self Counseling
                    provides ongoing therapeutic support. Contact us for more information about our services.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

