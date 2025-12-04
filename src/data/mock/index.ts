/**
 * Capa de Datos - Mock Data
 * 
 * Datos de ejemplo para desarrollo y testing.
 * En producción, estos datos vendrán de APIs o bases de datos.
 */

import type { User, Product } from '../models';

// Datos mock de usuarios
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatar: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    createdAt: new Date('2024-02-20'),
  },
];

// Datos mock de productos
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Producto Ejemplo',
    description: 'Descripción del producto',
    price: 99.99,
    image: 'https://via.placeholder.com/300',
    category: 'Electrónica',
  },
];

