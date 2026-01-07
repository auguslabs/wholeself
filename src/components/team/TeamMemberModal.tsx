import React, { useEffect, useState } from 'react';
import type { TeamMember } from '@/data/models/TeamMember';
import { getFullName, getDescription, getPhotoPath } from '@/data/models/TeamMember';
import { useSwipe } from '@/hooks/useSwipe';

interface TeamMemberModalProps {
  member: TeamMember | null;
  allMembers: TeamMember[];
  photoType: 'square' | 'rounded-white' | 'rounded-color' | 'rounded-decorative';
  isOpen: boolean;
  onClose: () => void;
  onMemberChange: (member: TeamMember) => void;
  pageLanguage: 'en' | 'es';
}

/**
 * Modal para mostrar información detallada del terapeuta
 * Con navegación tipo Instagram Stories (swipe izquierda/derecha)
 */
export function TeamMemberModal({
  member,
  allMembers,
  photoType,
  isOpen,
  onClose,
  onMemberChange,
  pageLanguage,
}: TeamMemberModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Encontrar índice del miembro actual
  useEffect(() => {
    if (member && allMembers.length > 0) {
      const index = allMembers.findIndex((m) => m.id === member.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [member, allMembers]);

  // Navegar al siguiente miembro
  const goToNext = () => {
    if (allMembers.length === 0) return;
    const nextIndex = (currentIndex + 1) % allMembers.length;
    setCurrentIndex(nextIndex);
    onMemberChange(allMembers[nextIndex]);
  };

  // Navegar al miembro anterior
  const goToPrevious = () => {
    if (allMembers.length === 0) return;
    const prevIndex = currentIndex === 0 ? allMembers.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onMemberChange(allMembers[prevIndex]);
  };

  // Swipe handlers
  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50,
  });

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Disparar evento para ocultar el botón de Crisis Resources en móvil
      const event = new CustomEvent('teamModalOpened');
      window.dispatchEvent(event);
    } else {
      // Disparar evento para mostrar el botón de Crisis Resources en móvil
      const event = new CustomEvent('teamModalClosed');
      window.dispatchEvent(event);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      // Asegurarse de mostrar el botón cuando el componente se desmonte
      if (isOpen) {
        const event = new CustomEvent('teamModalClosed');
        window.dispatchEvent(event);
      }
    };
  }, [isOpen, currentIndex, allMembers]);

  if (!isOpen || !member) {
    return null;
  }

  const fullName = getFullName(member);
  const description = getDescription(member, pageLanguage);
  const photoPath = getPhotoPath(member, photoType);

  // Si no hay descripción en el idioma solicitado, usar el otro
  const finalDescription =
    description || getDescription(member, pageLanguage === 'en' ? 'es' : 'en');

  const canGoPrevious = allMembers.length > 1;
  const canGoNext = allMembers.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenedor del modal */}
      <div className="relative flex items-center w-full max-w-5xl">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative border-b-4 border-blueGreen-500 mx-auto pb-0"
          onClick={(e) => e.stopPropagation()}
          {...swipeHandlers}
        >
          {/* Flechas sutiles dentro del modal - ocultas por ahora ya que el swipe funciona */}
          {false && canGoPrevious && allMembers.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border border-blueGreen-200/50"
              aria-label="Previous member"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-blueGreen-600 group-hover:text-blueGreen-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {false && canGoNext && allMembers.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border border-blueGreen-200/50"
              aria-label="Next member"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-blueGreen-600 group-hover:text-blueGreen-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Barra fija verde con indicadores de posición (puntos tipo Instagram) */}
          {allMembers.length > 1 && (
            <div className="sticky top-0 z-30 bg-blueGreen-300 px-4 py-3 flex justify-center items-center gap-2 rounded-t-2xl">
              {/* Puntos de navegación */}
              {allMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    onMemberChange(allMembers[index]);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-blueGreen-700 w-8'
                      : 'bg-blueGreen-200 w-2 hover:bg-blueGreen-300'
                  }`}
                  aria-label={`Go to member ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Contenido del modal */}
          <div className="p-6 md:p-8 lg:p-10 overflow-y-auto" style={{ paddingBottom: '80px' }}>
          {/* Fila 1: Nombre/Rol izquierda, Foto pequeña derecha */}
          <div className="flex flex-row items-start justify-between gap-6 mb-6">
            {/* Información izquierda */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2">
                {fullName}
              </h2>

              {member.credentials && (
                <p className="text-lg text-tealBlue-600 font-semibold mb-2">
                  {member.credentials}
                </p>
              )}

              {member.pronouns && (
                <p className="text-sm text-navy-500 mb-2">{member.pronouns}</p>
              )}

              <p className="text-xl text-navy-700 font-medium">{member.role}</p>
            </div>

            {/* Foto pequeña derecha */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={photoPath}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción completa */}
          <div className="mt-6">
            <div className="prose prose-lg max-w-none">
              <div
                className="text-navy-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: finalDescription.replace(/\n/g, '<br />'),
                }}
              />
            </div>
          </div>
          </div>

          {/* Barra de controles fija en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between rounded-b-2xl">
            {/* Botón cerrar a la izquierda */}
            <button
              onClick={onClose}
              className="bg-blueGreen-300 hover:bg-blueGreen-400 rounded-full p-2.5 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-blueGreen-700 group-hover:text-blueGreen-800 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Flechas de navegación a la derecha */}
            {allMembers.length > 1 && (
              <div className="flex items-center gap-2">
                {/* Flecha izquierda */}
                {canGoPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="bg-blueGreen-300 hover:bg-blueGreen-400 rounded-full p-2.5 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                    aria-label="Previous member"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-blueGreen-700 group-hover:text-blueGreen-800 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Flecha derecha */}
                {canGoNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="bg-blueGreen-300 hover:bg-blueGreen-400 rounded-full p-2.5 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                    aria-label="Next member"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-blueGreen-700 group-hover:text-blueGreen-800 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
