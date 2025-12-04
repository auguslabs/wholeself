// Importar React para usar componentes funcionales
import React from 'react';

/**
 * Componente Footer - Layout
 * 
 * Pie de página de la aplicación con enlaces a todas las páginas principales.
 * Incluye Crisis Resources siempre visible para acceso rápido.
 */
export function Footer() {
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
              Whole Self Counseling
            </h3>
            {/* Texto descriptivo en gris oscuro */}
            <p className="text-gray-700">
              A safe space for your healing journey.
            </p>
          </div>
          {/* Segunda columna: Enlaces de navegación */}
          <div>
            {/* Título de la sección de enlaces */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Navigation
            </h3>
            {/* Lista de enlaces con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {/* Enlace a Home */}
              <li>
                <a href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </a>
              </li>
              {/* Enlace a Services */}
              <li>
                <a href="/services" className="hover:text-gray-900 transition-colors">
                  Services
                </a>
              </li>
              {/* Enlace a What to Expect */}
              <li>
                <a href="/what-to-expect" className="hover:text-gray-900 transition-colors">
                  What to Expect
                </a>
              </li>
              {/* Enlace a Investment */}
              <li>
                <a href="/investment" className="hover:text-gray-900 transition-colors">
                  Investment
                </a>
              </li>
              {/* Enlace a Team */}
              <li>
                <a href="/team" className="hover:text-gray-900 transition-colors">
                  Team
                </a>
              </li>
              {/* Enlace a Contact */}
              <li>
                <a href="/contact" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          {/* Tercera columna: Recursos importantes */}
          <div>
            {/* Título de la sección de recursos */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Resources
            </h3>
            {/* Lista de recursos con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {/* Enlace a Crisis Resources (siempre visible, importante) */}
              <li>
                <a href="/crisis-resources" className="hover:text-gray-900 font-semibold transition-colors">
                  Crisis Resources
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Sección de copyright con borde superior y texto centrado */}
        <div className="mt-8 pt-8 border-t border-gray-600 text-center text-gray-700">
          {/* Texto de copyright con año dinámico */}
          <p>&copy; {new Date().getFullYear()} Whole Self Counseling. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

