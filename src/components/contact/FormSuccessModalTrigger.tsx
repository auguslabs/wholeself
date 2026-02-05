'use client';

import React, { useEffect, useState } from 'react';
import { pathWithBase } from '@/utils/basePath';
import FormSuccessModal from './FormSuccessModal';

const EVENT_NAME = 'form-success';

export type FormSuccessDetail = { lang: 'en' | 'es' };

/**
 * Escucha el evento global 'form-success' (detail: { lang }) y muestra el modal de éxito.
 * Al completar (clic o 5s) redirige a la página de inicio en el idioma correspondiente.
 */
export default function FormSuccessModalTrigger() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    const handler = (e: CustomEvent<FormSuccessDetail>) => {
      const l = e.detail?.lang ?? 'en';
      setLang(l);
      setOpen(true);
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, []);

  const handleComplete = () => {
    setOpen(false);
    const homeHref = pathWithBase(lang === 'es' ? '/es/' : '/');
    window.location.href = homeHref;
  };

  return <FormSuccessModal open={open} lang={lang} onComplete={handleComplete} />;
}
