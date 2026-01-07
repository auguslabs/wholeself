import React, { useState } from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

/**
 * Props del componente LoginForm
 */
interface LoginFormProps {
  loginContent: {
    title: LocalizedText;
    subtitle?: LocalizedText;
    form: {
      username: {
        label: LocalizedText;
        placeholder: LocalizedText;
      };
      password: {
        label: LocalizedText;
        placeholder: LocalizedText;
      };
      submit: LocalizedText;
      loading: LocalizedText;
      errors: {
        invalidCredentials: LocalizedText;
        recaptchaFailed: LocalizedText;
        required: LocalizedText;
        network: LocalizedText;
      };
    };
  };
  language?: 'en' | 'es';
}

/**
 * Componente LoginForm - Panel de Administración
 * 
 * Formulario de login para el panel de administración.
 * Por ahora solo muestra la interfaz. La integración con API será en la siguiente fase.
 */
export default function LoginForm({ loginContent, language = 'en' }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = loginContent.form;

  /**
   * Maneja el envío del formulario
   * Por ahora: redirige directamente al dashboard sin validación
   * TODO: Implementar autenticación real en siguiente fase
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Redirigir al dashboard sin validación
    window.location.href = '/admin/dashboard';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Campo Usuario */}
      <div>
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {getLocalizedText(form.username.label, language)}
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={getLocalizedText(form.username.placeholder, language)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b] focus:border-transparent"
          disabled={isLoading}
          autoComplete="username"
        />
      </div>

      {/* Campo Contraseña */}
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {getLocalizedText(form.password.label, language)}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={getLocalizedText(form.password.placeholder, language)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b] focus:border-transparent"
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          backgroundColor: '#07549b',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#064080';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#07549b';
        }}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {getLocalizedText(form.loading, language)}
          </>
        ) : (
          getLocalizedText(form.submit, language)
        )}
      </button>

      {/* Nota: reCAPTCHA se agregará en la siguiente fase */}
      <p className="text-xs text-gray-500 text-center mt-4">
        * La validación reCAPTCHA se implementará en la siguiente fase
      </p>
    </form>
  );
}
