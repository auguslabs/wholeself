/**
 * Capa de Servicios - API
 * 
 * Aquí se manejan todas las llamadas a APIs externas.
 * Centraliza la lógica de comunicación con servicios externos.
 */

import type { ApiResponse } from '@/data/models';

// Configuración base de la API
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api.example.com';

/**
 * Cliente HTTP genérico para hacer peticiones
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Ejemplo de servicio para obtener usuarios
 */
export async function getUsers() {
  return fetchAPI('/users');
}

/**
 * Ejemplo de servicio para obtener un usuario por ID
 */
export async function getUserById(id: string) {
  return fetchAPI(`/users/${id}`);
}

/**
 * Ejemplo de servicio para crear un usuario
 */
export async function createUser(data: unknown) {
  return fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

