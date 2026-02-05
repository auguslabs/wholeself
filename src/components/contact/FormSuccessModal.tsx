'use client';

import React, { useEffect, useRef, useState } from 'react';
import { pathWithBase } from '@/utils/basePath';

const DURATION_MS = 5000;

const copy = {
  en: {
    message:
      'We have received your information. We will contact you within the next 48 hours or less.',
    button: 'Return to home',
  },
  es: {
    message:
      'Hemos recibido la información. Te contactaremos dentro de las próximas 48 horas o menos.',
    button: 'Volver al inicio',
  },
};

export interface FormSuccessModalProps {
  open: boolean;
  lang: 'en' | 'es';
  onComplete: () => void;
}

/**
 * Modal de éxito tras enviar un formulario.
 * Muestra mensaje de confirmación, fondo con blur, y un botón con barra de progreso
 * que se llena en 5 segundos; al completar o al hacer clic se redirige a inicio.
 * UX: proporción landscape en escritorio, portrait en móvil; paleta del sitio.
 */
export default function FormSuccessModal({ open, lang, onComplete }: FormSuccessModalProps) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const t = copy[lang];

  useEffect(() => {
    if (!open) {
      setProgress(0);
      if (progressBarRef.current) progressBarRef.current.style.width = '0%';
      startTimeRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const start = startTimeRef.current ?? now;
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(p);
      // Actualizar el ancho directamente en el DOM para que la animación se vea cada frame
      if (progressBarRef.current) progressBarRef.current.style.width = `${p}%`;

      if (p >= 100) {
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, onComplete]);

  const handleButtonClick = () => {
    onComplete();
  };

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  const homeHref = pathWithBase(lang === 'es' ? '/es/' : '/');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-success-title"
      aria-describedby="form-success-desc"
    >
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Contenedor del modal: landscape (ancho) en desktop, portrait en móvil */}
      <div
        ref={containerRef}
        className="relative flex flex-col w-[92vw] max-w-md md:max-w-2xl rounded-2xl bg-white shadow-xl p-8 md:p-10 border border-softAquaGray-200"
        style={{ maxHeight: '90vh' }}
      >
        {/* Mensaje arriba; empuja el botón hacia abajo */}
        <div id="form-success-desc" className="flex-1 min-h-0 pt-0 pb-6">
          <h2
            id="form-success-title"
            className="text-xl md:text-2xl font-semibold text-navy-800 leading-tight"
          >
            {t.message}
          </h2>
        </div>

        {/* Botón abajo: color neutro que va cambiando al verde del header (blueGreen) */}
        <div className="mt-auto flex flex-col shrink-0 mx-0 w-full">
          <a
            href={homeHref}
            onClick={(e) => {
              e.preventDefault();
              handleButtonClick();
            }}
            className="relative block w-full overflow-hidden rounded-lg bg-softAquaGray-300 border-2 border-blueGreen-500 font-medium py-4 px-6 text-center min-h-[3.5rem] focus:outline-none focus:ring-2 focus:ring-blueGreen-500 focus:ring-offset-2 hover:opacity-95 active:opacity-90"
          >
            {/* Barra de progreso: relleno verde (mismo verde del header) de izquierda a derecha */}
            <span
              ref={progressBarRef}
              className="absolute top-0 left-0 bottom-0 z-[1] pointer-events-none rounded-l-[6px] bg-blueGreen-500"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
            <span className="relative z-10 text-navy-800 font-medium">{t.button}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
