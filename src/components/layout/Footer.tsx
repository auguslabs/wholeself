// Importar React para usar componentes funcionales
import React from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import { withLocalePath } from '@/utils/i18n';
import type { ContentPage } from '@/data/models/ContentPage';

/**
 * Props del componente Footer
 */
interface FooterProps {
  footerData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente Footer - Layout
 * 
 * Pie de página de la aplicación con enlaces a todas las páginas principales.
 * Incluye Crisis Resources siempre visible para acceso rápido.
 * Contenido cargado desde shared/footer.json
 */
export function Footer({ footerData, language = 'en' }: FooterProps) {
  const content = footerData.content;
  const companyInfo = content.companyInfo;
  const navigation = content.navigation;
  const resources = content.resources;
  const copyright = content.copyright;


  const basePath = language === 'es' ? '/es' : '';
  const withLocale = (path: string) => (basePath ? `${basePath}${path}` : path);

  // Enlaces de navegación (hardcodeados por ahora, se pueden mover a JSON después)
  const navLinks = [
    { label: { en: 'Home', es: 'Inicio' }, href: basePath ? `${basePath}/` : '/' },
    { label: { en: 'Services', es: 'Servicios' }, href: withLocale('/services') },
    { label: { en: 'What to Expect', es: 'Que Esperar' }, href: withLocale('/what-to-expect') },
    { label: { en: 'Rates', es: 'Tarifas' }, href: withLocale('/rates') },
    { label: { en: 'Team', es: 'Equipo' }, href: withLocale('/team') },
    { label: { en: 'Contact', es: 'Contacto' }, href: withLocale('/contact') },
  ];

  return (
    // Elemento footer principal con fondo blueGreen-300 (mismo que el header)
    <footer className="bg-blueGreen-300 text-gray-900">
      {/* Contenedor principal con ancho máximo y padding responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid responsive: 1 columna en móvil, 3 columnas en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Primera columna: Información de la empresa */}
          <div>
            {/* Título de la sección con tamaño grande y negrita */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(companyInfo.name, language)}
            </h3>
            {/* Texto descriptivo en gris oscuro */}
            <p className="text-gray-700">
              {getLocalizedText(companyInfo.tagline, language)}
            </p>
          </div>
          {/* Segunda columna: Enlaces de navegación */}
          <div>
            {/* Título de la sección de enlaces */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(navigation.title, language)}
            </h3>
            {/* Lista de enlaces con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    data-astro-transition-scroll="false"
                    className="hover:text-gray-900 transition-colors"
                  >
                    {getLocalizedText(link.label, language)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Tercera columna: Recursos importantes */}
          <div>
            {/* Título de la sección de recursos */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(resources.title, language)}
            </h3>
            {/* Lista de recursos con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {resources.items.map((item: any) => {
                // Si es un modal, usar botón que dispara evento
                if (item.isModal) {
                  return (
                    <li key={item.link}>
                      <button
                        onClick={() => {
                          // Disparar evento custom para abrir el modal de Crisis Resources
                          const event = new CustomEvent('openCrisisModal');
                          window.dispatchEvent(event);
                        }}
                        className="hover:text-gray-900 transition-colors text-left"
                      >
                        {getLocalizedText(item.label, language)}
                      </button>
                    </li>
                  );
                }
                // Si es un enlace externo, abrir en nueva pestaña
                const isExternal = item.link.startsWith('http');
                const resolvedLink = withLocalePath(item.link, language);
                return (
                  <li key={item.link}>
                    <a 
                      href={resolvedLink} 
                      data-astro-transition-scroll="false"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {getLocalizedText(item.label, language)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {/* Sección de copyright con borde superior y texto centrado */}
        <div className="mt-8 pt-8 border-t border-gray-600 text-center text-gray-700">
          {/* Texto de copyright con año dinámico e icono de administración */}
          {/* En móvil: flex-col (apilado), en desktop: flex-row (misma línea) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <span>
              &copy; {new Date().getFullYear()} {getLocalizedText(companyInfo.name, language)}. {getLocalizedText(copyright, language)}
            </span>
            {/* Icono de acceso al panel de administración */}
            <a 
              href="/admin/login" 
              className="inline-flex text-gray-600 hover:text-gray-900 transition-colors"
              title="Panel de Administración"
              aria-label="Acceso al panel de administración"
              rel="nofollow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

