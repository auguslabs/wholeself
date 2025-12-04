/**
 * Capa de Datos - Modelos
 * 
 * Define aquí los tipos e interfaces de datos que se usarán en toda la aplicación.
 * Esta es la capa base que define la estructura de los datos.
 */

// Ejemplo de modelo de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

// Ejemplo de modelo de producto
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

// Ejemplo de respuesta de API genérica
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

