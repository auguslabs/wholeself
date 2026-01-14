# Guía: Cómo Editar el JSON con Caracteres Especiales Correctamente

## 📋 Resumen

Este documento explica cómo editar el archivo `src/data/content/pages/team.json` para asegurar que los caracteres especiales (acentos, apóstrofes, etc.) se muestren correctamente.

## ✅ Opción Recomendada: Editar Directamente con Caracteres UTF-8

### ¿Por qué esta es la mejor opción?

1. **Más fácil**: Simplemente escribes los caracteres como los ves (á, é, í, ó, ú, ñ, ¡, ¿)
2. **Más legible**: El JSON es fácil de leer y entender
3. **Menos errores**: No necesitas recordar códigos Unicode
4. **El editor se encarga**: Los editores modernos (VS Code, etc.) guardan automáticamente en UTF-8

### Cómo hacerlo:

1. **Abre el archivo** `src/data/content/pages/team.json` en tu editor
2. **Escribe directamente los caracteres**:
   - `á`, `é`, `í`, `ó`, `ú` (vocales con acento)
   - `Á`, `É`, `Í`, `Ó`, `Ú` (mayúsculas con acento)
   - `ñ`, `Ñ` (eñe)
   - `¡`, `¿` (signos de exclamación e interrogación invertidos)
   - `'` (apóstrofe recto, no curvo)

3. **Asegúrate de que tu editor guarde en UTF-8**:
   - En VS Code: Verifica que en la barra inferior diga "UTF-8"
   - Si dice otra cosa, haz clic y selecciona "Save with Encoding" → "UTF-8"

### Ejemplo:

```json
{
  "descriptionEn": "Allie's clinical practice is...",
  "descriptionEs": "La práctica clínica de Allie es..."
}
```

**NOTA**: La función `normalizeSpecialCharacters` corregirá automáticamente cualquier carácter que esté mal codificado, pero es mejor escribirlos correctamente desde el inicio.

---

## 🔧 Opción Alternativa: Usar Códigos Unicode (No Recomendado)

Si por alguna razón prefieres usar códigos Unicode, aquí están los más comunes:

### Vocales Acentuadas:
- `\u00E1` = `á`
- `\u00E9` = `é`
- `\u00ED` = `í`
- `\u00F3` = `ó`
- `\u00FA` = `ú`
- `\u00C1` = `Á`
- `\u00C9` = `É`
- `\u00CD` = `Í`
- `\u00D3` = `Ó`
- `\u00DA` = `Ú`

### Eñe:
- `\u00F1` = `ñ`
- `\u00D1` = `Ñ`

### Signos Especiales:
- `\u00A1` = `¡`
- `\u00BF` = `¿`
- `\u2019` = `'` (apóstrofe curvo derecho)
- `\u2018` = `'` (apóstrofe curvo izquierdo)

### Ejemplo con Unicode:

```json
{
  "descriptionEs": "La pr\u00E1ctica cl\u00EDnica de Allie es..."
}
```

**⚠️ ADVERTENCIA**: Esta opción es más tediosa y propensa a errores. Solo úsala si tu editor no soporta UTF-8 correctamente.

---

## 🔍 Cómo Verificar que Está Correcto

### 1. Verificar en el Editor:
- Abre el JSON en tu editor
- Los caracteres deben verse correctamente (á, é, í, ó, ú, ñ, etc.)
- Si ves símbolos raros (, ?, etc.), el archivo no está en UTF-8

### 2. Verificar en el Navegador:
- Abre la página de Team
- Abre el modal de un miembro del equipo
- Los caracteres deben verse correctamente
- Si ves `?` o símbolos raros, hay un problema de codificación

### 3. Verificar en la Consola:
- Abre las herramientas de desarrollador (F12)
- Ve a la consola
- Busca mensajes que digan "✅ Loaded X team members"
- Si hay errores de codificación, aparecerán aquí

---

## 🛠️ Solución de Problemas

### Problema: Los caracteres se ven como `?` o símbolos raros

**Solución**:
1. Verifica que el archivo esté guardado en UTF-8
2. En VS Code: Click en la barra inferior donde dice la codificación → "Save with Encoding" → "UTF-8"
3. Re-escribe los caracteres problemáticos directamente

### Problema: Los apóstrofes no se muestran correctamente

**Solución**:
1. Usa el apóstrofe recto: `'` (tecla al lado del Enter)
2. NO uses el apóstrofe curvo: `'` o `'`
3. La función de normalización corregirá automáticamente los apóstrofes curvos si los hay

### Problema: Los acentos en español no se muestran

**Solución**:
1. Asegúrate de escribir directamente: `á`, `é`, `í`, `ó`, `ú`, `ñ`
2. Si tu teclado no tiene estos caracteres, puedes:
   - Copiar y pegar desde este documento
   - Usar códigos Unicode (ver opción alternativa arriba)
   - Cambiar la configuración de tu teclado a español

---

## 📝 Lista de Verificación

Antes de guardar el JSON, verifica:

- [ ] El archivo está guardado en UTF-8
- [ ] Los acentos se ven correctamente (á, é, í, ó, ú)
- [ ] La eñe se ve correctamente (ñ, Ñ)
- [ ] Los signos de exclamación/interrogación se ven correctamente (¡, ¿)
- [ ] Los apóstrofes son rectos (`'`) no curvos (`'` o `'`)
- [ ] No hay caracteres de reemplazo Unicode () visibles

---

## 💡 Consejos Finales

1. **Siempre edita directamente con los caracteres correctos** - Es más fácil y menos propenso a errores
2. **Guarda el archivo en UTF-8** - Esto es crítico para que funcione
3. **Prueba en el navegador** - Después de editar, verifica que se vea correctamente
4. **La función de normalización es un respaldo** - Corregirá caracteres mal codificados, pero es mejor escribirlos bien desde el inicio

---

## 📚 Referencias

- [UTF-8 Encoding](https://en.wikipedia.org/wiki/UTF-8)
- [Unicode Character Table](https://unicode-table.com/)
- [JSON Specification](https://www.json.org/json-en.html)

---

**Última actualización**: 2024-2025
**Archivo relacionado**: `src/data/content/pages/team.json`
**Función de normalización**: `src/data/services/teamService.ts` → `normalizeSpecialCharacters()`
