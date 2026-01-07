# Instrucciones para el Menú de Plumas de Pavo Real

## Implementación Completada

He implementado el menú móvil con efecto de plumas de pavo real. El componente está listo y funcionando.

## Archivos Creados/Modificados

1. **`src/components/layout/PeacockMenu.tsx`** - Componente principal del menú con plumas
2. **`src/components/layout/Header.tsx`** - Modificado para integrar el nuevo menú móvil
3. **`src/components/layout/index.ts`** - Actualizado para exportar PeacockMenu
4. **`public/menu-feathers/`** - Carpeta creada para almacenar los SVGs de las plumas

## Cómo Funciona

1. **Botón del Menú**: En móvil, aparece un botón "menu" debajo del logo
2. **Despliegue**: Al hacer clic, las 6 plumas se despliegan en semicírculo (180 grados)
3. **Animación Escalonada**: Cada pluma aparece con un delay de 100ms respecto a la anterior
4. **Clics Independientes**: Cada pluma es un enlace independiente y cliqueable
5. **Cierre**: Se cierra al hacer clic en una pluma o en el overlay de fondo

## Próximos Pasos - Crear los SVGs

Necesitas crear 6 archivos SVG en Illustrator y guardarlos en `public/menu-feathers/` con estos nombres:

1. `feather-home.svg`
2. `feather-services.svg`
3. `feather-what-to-expect.svg`
4. `feather-investment.svg`
5. `feather-team.svg`
6. `feather-contact.svg`

### Especificaciones para los SVGs:

- **Tamaño**: Aproximadamente 120px de ancho máximo (altura variable)
- **Texto**: Debe incluir el texto del menú integrado en el SVG
- **Forma**: Plumas alargadas y curvas (como en tu diseño)
- **Colores**: Usar los colores del tema (tealBlue-600, etc.)

### Notas Importantes:

- Los SVGs se rotarán automáticamente según su posición en el semicírculo
- El componente aplica efectos hover automáticamente
- Si un SVG no existe, se mostrará un placeholder azul con el texto del menú

## Testing

Para probar el menú:

1. Abre el sitio en un dispositivo móvil o en modo responsive (ancho < 768px)
2. Haz clic en el botón "menu" debajo del logo
3. Verás las plumas desplegarse en semicírculo
4. Cada pluma es cliqueable y navegará a su página correspondiente

## Personalización

Si necesitas ajustar:
- **Radio del semicírculo**: Modifica la variable `radius` en `calculateFeatherPosition()`
- **Velocidad de animación**: Cambia `duration-700` en el className del enlace
- **Delays**: Modifica `delay = index * 100` para cambiar el tiempo entre plumas
- **Tamaño de plumas**: Ajusta `h-24` y `maxWidth: '120px'` en el img

