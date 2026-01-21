# Lista de Aseguradoras - Orden Alfabético

Lista completa de aseguradoras aceptadas para descargar logos. Los logos deben guardarse en formato SVG (preferido) o PNG en la carpeta:

`public/logos/insurance/`

## Lista de Aseguradoras (13 total)

1. **Aetna**
   - Nombre del archivo sugerido: `aetna.svg` o `aetna.png`

2. **Ambetter**
   - Nombre del archivo sugerido: `ambetter.svg` o `ambetter.png`

3. **Blue Cross Blue Shield**
   - Nombre del archivo sugerido: `blue-cross-blue-shield.svg` o `blue-cross-blue-shield.png`

4. **Cigna and Evernorth**
   - Nombre del archivo sugerido: `cigna-evernorth.svg` o `cigna-evernorth.png`

5. **Magellan**
   - Nombre del archivo sugerido: `magellan.svg` o `magellan.png`

6. **Medicare**
   - Nombre del archivo sugerido: `medicare.svg` o `medicare.png`

7. **Mines and Associates**
   - Nombre del archivo sugerido: `mines-associates.svg` o `mines-associates.png`

8. **New Mexico Medicaid**
   - Nombre del archivo sugerido: `new-mexico-medicaid.svg` o `new-mexico-medicaid.png`

9. **New Mexico Medical Insurance Pool**
   - Nombre del archivo sugerido: `new-mexico-medical-insurance-pool.svg` o `new-mexico-medical-insurance-pool.png`

10. **Optum**
    - Nombre del archivo sugerido: `optum.svg` o `optum.png`

11. **Presbyterian**
    - Nombre del archivo sugerido: `presbyterian.svg` o `presbyterian.png`

12. **Tricare**
    - Nombre del archivo sugerido: `tricare.svg` o `tricare.png`

13. **United Healthcare**
    - Nombre del archivo sugerido: `united-healthcare.svg` o `united-healthcare.png`

---

## Notas Importantes

- **Formatos aceptados**: **SVG** o **PNG** (ambos funcionan)
  - El sistema intentará cargar primero el formato SVG
  - Si el SVG no existe, intentará cargar el PNG automáticamente
  - Si ninguno de los dos existe, se mostrará el nombre de la aseguradora como texto
- **Formato recomendado**: SVG (escalable y de mejor calidad)
- **Formato alternativo**: PNG con fondo transparente
- **Tamaño recomendado**: Los logos se mostrarán con `max-h-12` (48px de altura máxima)
- **Ubicación**: Todos los logos deben guardarse en `public/logos/insurance/`
- **Nombres de archivo**: Usar nombres en minúsculas con guiones (kebab-case) como se muestra arriba

## Respuesta a Pregunta Técnica

**¿Puedo usar cualquiera de los dos formatos?**

**Sí, ambos formatos funcionan.** El código está diseñado para:
1. Intentar cargar primero el archivo `.svg`
2. Si el SVG no existe o falla, intentar automáticamente el archivo `.png`
3. Si ambos fallan, mostrar el nombre de la aseguradora como texto

**Para el cliente:**
- Pueden subir logos en formato **SVG** o **PNG**
- No necesitan preocuparse por el formato específico
- El sistema manejará automáticamente la carga del logo correcto
- Si agregan un nuevo proveedor, pueden usar cualquiera de los dos formatos

## Cómo se usan en el código

El componente `InsuranceModal.tsx` busca automáticamente los logos usando estos nombres de archivo. El sistema intenta cargar SVG primero, luego PNG, y finalmente muestra el nombre de la aseguradora como texto de respaldo si ninguno está disponible.
