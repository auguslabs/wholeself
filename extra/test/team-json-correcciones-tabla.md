# Tabla de correcciones — `src/data/content/pages/team.json`

Correcciones aplicadas para eliminar errores de linter (JSON inválido) y unificar saltos de línea.

---

## Resumen

| # | Línea aprox. | Miembro / contexto | Tipo de error | Qué se cambió |
|---|--------------|-------------------|---------------|----------------|
| 1 | 53 | Andrea Lucero (descriptionEs) | Secuencia de escape inválida `\C` en JSON | `.\n\Como` → `.\n\nComo` |
| 2 | 81 | Charlycia Strain (descriptionEs) | Secuencia de escape inválida `\c` | `.\n\crecí` → `.\n\ncrecí` |
| 3 | 81 | Charlycia Strain (descriptionEs) | Secuencia de escape inválida `\T` | `.\n\Tengo` → `.\n\nTengo` |
| 4 | 81 | Charlycia Strain (descriptionEs) | Secuencia de escape inválida | `.\n\también` → `.\n\ntambién` |
| 5 | 94 | Chavonne McClay (descriptionEn) | Secuencia de escape inválida `\B` | `.\n\Because` → `.\n\nBecause` |
| 6 | 123 | Darbus (descriptionEs) | Valor sin comillas (JSON inválido) | Se envolvió todo el valor en comillas dobles: `"¡Conozcan a Darbus...!"` |
| 7 | 137 | Diana Hernández (descriptionEs) | Secuencia de escape inválida | `.\n\ Cuento` → `.\n\nCuento` |
| 8 | 137 | Diana Hernández (descriptionEs) | Secuencia de escape inválida | `.\n\Mis` → `.\n\nMis` |
| 9 | 137 | Diana Hernández (descriptionEs) | Secuencia de escape inválida | `.\n\Como` → `.\n\nComo` |
| 10 | 151 | Scarlett Cortez (descriptionEs) | Secuencia de escape inválida `\c` | `.\n\como` → `.\n\nComo` |
| 11 | 178 | Esperanza Flores (descriptionEn) | Secuencia de escape inválida `\a` | `.\n\aside` → `.\n\nAside` |
| 12 | 178 | Esperanza Flores (descriptionEn) | Secuencia de escape inválida `\a` | `.\n\awakening` → `.\n\nAwakening` |

---

## Detalle por tipo

### 1. Secuencias de escape inválidas en JSON

En JSON solo son válidas secuencias como `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`, `\uXXXX`.  
Se habían escrito `\n\` seguidas de una letra (p. ej. `\n\Como`), lo que el parser interpreta como escape inválido (p. ej. `\C`).

| Antes (error) | Después (correcto) |
|---------------|---------------------|
| `.\n\Como` | `.\n\nComo` |
| `.\n\crecí` | `.\n\ncrecí` |
| `.\n\Tengo` | `.\n\nTengo` |
| `.\n\también` | `.\n\ntambién` |
| `.\n\Because` | `.\n\nBecause` |
| `.\n\ Cuento` | `.\n\nCuento` |
| `.\n\Mis` | `.\n\nMis` |
| `.\n\como` | `.\n\nComo` |
| `.\n\aside` | `.\n\nAside` |
| `.\n\awakening` | `.\n\nAwakening` |

Intención: dos saltos de línea (`\n\n`), no `\n` + backslash + texto.

### 2. Valor sin comillas (Darbus, descriptionEs)

El valor de `descriptionEs` para Darbus (línea 123) no estaba entre comillas dobles, lo que rompía el JSON.

| Antes (error) | Después (correcto) |
|---------------|---------------------|
| `"descriptionEs":  ¡Conozcan a Darbus...` | `"descriptionEs":  "¡Conozcan a Darbus...!"` |

Se añadieron las comillas dobles de apertura y cierre alrededor de todo el texto del valor.

---

## Resultado

- **Antes:** 16 errores de linter (Invalid escape, Value expected, Property keys must be doublequoted, etc.).
- **Después:** 0 errores de linter; el archivo es JSON válido.

---

## Nota sobre caracteres corruptos

En el archivo pueden quedar caracteres de reemplazo () en palabras como “únicamente” (Amy, Dulce) o “así” (Sonia). No generan error de linter pero conviene corregirlos en el contenido (por ejemplo en el editor, guardando el archivo en UTF-8 y reemplazando por la letra correcta).

---

*Generado tras revisar y corregir `src/data/content/pages/team.json`.*
