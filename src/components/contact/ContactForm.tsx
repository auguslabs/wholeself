'use client';

import React, { useState } from 'react';
import type { ContentPage } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';
import ContactFormLinks from './ContactFormLinks';

interface ContactFormProps {
  contactData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente ContactForm - Formulario de contacto
 * 
 * Formulario minimalista con 3 campos: nombre, email y comentario.
 * Incluye validación básica y manejo de envío.
 */
export default function ContactForm({ contactData, language = 'en' }: ContactFormProps) {
  const formData = contactData.content.form;
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = language === 'en' ? 'Name is required' : 'El nombre es requerido';
    }

    if (!formState.email.trim()) {
      newErrors.email = language === 'en' ? 'Email is required' : 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = language === 'en' ? 'Please enter a valid email' : 'Por favor ingresa un correo válido';
    }

    if (!formState.comment.trim()) {
      newErrors.comment = language === 'en' ? 'Comment is required' : 'El comentario es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const apiBase = (import.meta.env.PUBLIC_API_BASE as string) || '';
      const url = apiBase ? `${apiBase}/api/forms/contact.php` : '/api/forms/contact';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          comment: formState.comment.trim(),
          language,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setServerErrorMessage(null);
        setFormState({ name: '', email: '', comment: '' });
        window.dispatchEvent(new CustomEvent('form-success', { detail: { lang: language } }));
      } else {
        const errMsg = data.error || (language === 'en' ? 'There was an error sending your message. Please try again.' : 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
        setServerErrorMessage(errMsg);
        console.error('[contact] Form error:', res.status, data.error || data);
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (err) {
      console.error('[contact] Request failed:', err);
      setServerErrorMessage(null);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Texto introductorio */}
      <p className="text-gray-700 mb-6 leading-relaxed">
        {getLocalizedText(formData.introText, language)}
      </p>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Nombre */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-navy-900 mb-2"
          >
            {getLocalizedText(formData.fields.name.label, language)} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={getLocalizedText(formData.fields.name.placeholder, language)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tealBlue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Campo Email */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-navy-900 mb-2"
          >
            {getLocalizedText(formData.fields.email.label, language)} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={getLocalizedText(formData.fields.email.placeholder, language)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tealBlue-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Campo Comentario */}
        <div>
          <label 
            htmlFor="comment" 
            className="block text-sm font-medium text-navy-900 mb-2"
          >
            {getLocalizedText(formData.fields.comment.label, language)} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formState.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            placeholder={getLocalizedText(formData.fields.comment.placeholder, language)}
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tealBlue-500 focus:border-transparent transition-colors resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
          )}
        </div>

        {/* Mensajes de estado */}
        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {serverErrorMessage ?? (language === 'en' 
                ? 'There was an error sending your message. Please try again.' 
                : 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.')}
            </p>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-tealBlue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-tealBlue-700 focus:outline-none focus:ring-2 focus:ring-tealBlue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (language === 'en' ? 'Sending...' : 'Enviando...')
            : getLocalizedText(formData.submitButton, language)
          }
        </button>
      </form>

      {/* Enlaces a formularios especializados */}
      <ContactFormLinks language={language} />
    </div>
  );
}
