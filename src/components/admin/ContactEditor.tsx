import React from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';

/**
 * Props del componente ContactEditor
 */
interface ContactEditorProps {
  contactData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente ContactEditor
 * 
 * Editor de contenido para la página Contact
 * Muestra todos los campos editables de forma simple
 */
export function ContactEditor({ contactData, language = 'en' }: ContactEditorProps) {
  if (!contactData || !contactData.content) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error: Invalid contact data structure</p>
      </div>
    );
  }

  const content = contactData.content;
  const contactInfo = content.contactInfo;
  const address = contactInfo.address[language];
  const socialMedia = contactInfo.socialMedia;

  return (
    <div className="p-8 space-y-8">
      {/* Contact Information Section */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Contact Information</h2>
        
        <div className="space-y-6">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Address
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
              <div>
                <span className="text-xs text-gray-500">Street:</span>
                <p className="text-gray-900 font-medium">{address.street}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-gray-500">City:</span>
                  <p className="text-gray-900">{address.city}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">State:</span>
                  <p className="text-gray-900">{address.state}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">ZIP:</span>
                  <p className="text-gray-900">{address.zip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-900 font-medium">
                {getLocalizedText(contactInfo.email, language)}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-900 font-medium">
                {getLocalizedText(contactInfo.phone, language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Links Section */}
      <section>
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Social Media Links</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 break-all">
                {getLocalizedText(socialMedia.facebook, language)}
              </p>
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 break-all">
                {getLocalizedText(socialMedia.instagram, language)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
