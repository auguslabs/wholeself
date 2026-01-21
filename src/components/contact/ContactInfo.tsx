import React from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { ContentPage } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';

interface ContactInfoProps {
  contactData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente ContactInfo - Muestra información de contacto
 * 
 * Muestra dirección, teléfono, email y redes sociales con iconos.
 * Incluye un mapa embebido de Google Maps.
 */
export default function ContactInfo({ contactData, language = 'en' }: ContactInfoProps) {
  const contactInfo = contactData.content.contactInfo;
  const address = contactInfo.address?.[language] || contactInfo.address;
  const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  
  // URL para Google Maps embed (usando iframe estándar sin API key)
  // Formato: https://www.google.com/maps?q=ADDRESS&output=embed
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;
  
  // Verificar si existe socialMedia
  const socialMedia = contactInfo.socialMedia || null;

  const labels = {
    address: language === 'es' ? 'Dirección' : 'Address',
    phone: language === 'es' ? 'Teléfono' : 'Phone',
    email: language === 'es' ? 'Correo electrónico' : 'Email',
    follow: language === 'es' ? 'Síguenos' : 'Follow Us',
  };

  return (
    <div className="space-y-8">
      {/* Información de contacto */}
      <div className="space-y-6">
        {/* Dirección */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <MapPinIcon className="w-6 h-6 text-tealBlue-600" />
          </div>
          <div>
            <p className="text-navy-900 font-medium mb-1">{labels.address}</p>
            <p className="text-gray-700 leading-relaxed">
              {address.street}<br />
              {address.city}, {address.state} {address.zip}
            </p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <PhoneIcon className="w-6 h-6 text-tealBlue-600" />
          </div>
          <div>
            <p className="text-navy-900 font-medium mb-1">{labels.phone}</p>
            <a 
              href={`tel:${getLocalizedText(contactInfo.phone, language).replace(/\./g, '')}`}
              className="text-gray-700 hover:text-tealBlue-600 transition-colors"
            >
              {getLocalizedText(contactInfo.phone, language)}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <EnvelopeIcon className="w-6 h-6 text-tealBlue-600" />
          </div>
          <div>
            <p className="text-navy-900 font-medium mb-1">{labels.email}</p>
            <a 
              href={`mailto:${getLocalizedText(contactInfo.email, language)}`}
              className="text-gray-700 hover:text-tealBlue-600 transition-colors"
            >
              {getLocalizedText(contactInfo.email, language)}
            </a>
          </div>
        </div>

        {/* Horario de Oficina */}
        {contactInfo.officeHours && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ClockIcon className="w-6 h-6 text-tealBlue-600" />
            </div>
            <div>
              <p className="text-navy-900 font-medium mb-1">
                {getLocalizedText(contactInfo.officeHours.title, language)}
              </p>
              <p className="text-gray-700 mb-2">
                {getLocalizedText(contactInfo.officeHours.hours, language)}
              </p>
              <p className="text-sm text-gray-600 italic leading-relaxed">
                {getLocalizedText(contactInfo.officeHours.note, language)}
              </p>
            </div>
          </div>
        )}

        {/* Redes Sociales */}
        {socialMedia && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg 
                className="w-6 h-6 text-tealBlue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                />
              </svg>
            </div>
            <div>
            <p className="text-navy-900 font-medium mb-2">{labels.follow}</p>
              <div className="flex gap-4">
                {/* Facebook */}
                {socialMedia.facebook && (
                  <a
                    href={getLocalizedText(socialMedia.facebook, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-tealBlue-600 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {/* Instagram */}
                {socialMedia.instagram && (
                  <a
                    href={getLocalizedText(socialMedia.instagram, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-tealBlue-600 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="pt-4">
        <div className="rounded-lg overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapsEmbedUrl}
            title={language === 'es' ? 'Mapa de ubicación' : 'Location Map'}
          />
        </div>
      </div>
    </div>
  );
}
