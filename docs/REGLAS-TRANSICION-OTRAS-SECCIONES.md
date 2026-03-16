# Reglas para la transición hacia el resto de secciones

**Objetivo:** Definir los principios y las reglas que debe seguir cualquier agente o desarrollador al llevar **el resto de secciones y páginas** del sitio a “contenido desde BD”, para que la transición sea suave y sin repetir los errores de Home y Footer.

**Documento de aprendizaje (paso a paso):** **docs/GUIA-APRENDIZAJE-HOME-Y-FOOTER-PARA-NUEVAS-SECCIONES.md**

---

## 1. Principios (siempre vigentes)

1. **Todo el contenido editable vive en la base de datos.**  
   No hay “fuente secundaria” para textos o títulos que el editor pueda cambiar. La BD es la única fuente de verdad.

2. **El editor solo lee y escribe en la BD** a través de la API (GET para cargar, PUT para guardar). La misma API que usa el editor es la que usa el sitio público para leer.

3. **El front siempre lee desde la API/BD.**  
   No se usan fallbacks de **contenido** (textos, títulos, descripciones inventados en el código). Sí se permiten fallbacks **estructurales** (ej. lista vacía `[]`, objeto `{}`) para no romper el render. Si un dato falta, se corrige en la BD o en la migración, no con copy hardcodeado en el front.

4. **Una sección a la vez, una tabla a la vez.**  
   No implementar varias secciones en paralelo sin haber cerrado y probado la anterior. Orden recomendado: diseño y contrato → migración → API (GET + PUT) → servicio y componente → pruebas editor + front → siguiente sección.

5. **Mismo patrón que Home y Footer.**  
   Cualquier sección nueva que consuma la API debe seguir: refetch en el cliente al montar, cada 60 s y al volver a la pestaña; URL del fetch con `window.location.origin`; respuesta de la API con `meta`, `seo` (title y description presentes) y `content`; validación Zod en el front.

---

## 2. Reglas de implementación (resumen)

- **BD:** Tabla plana con filas por `locale` (en, es); migración con INSERT inicial y documentación en README de migraciones.
- **API GET:** Siempre devolver `seo: { title: { en, es }, description: { en, es } }` (aunque sea vacío). Normalizar en PHP los campos que el front muestra como títulos si la BD puede tener vacíos o `"0"`.
- **API PUT:** Usar `use ($str)` / `use ($loc)` en las closures que los necesiten; cadena de tipos de `bind_param` con exactamente el mismo número de caracteres que placeholders.
- **Cliente:** Fetch con `window.location.origin`; sin `PUBLIC_API_BASE` para contenido.
- **Componente:** Fetch al montar + `setInterval(60_000)` + `focus`; estado liveData; render con `liveData ?? initialData`; sin fallbacks de copy.

Detalle completo en **docs/GUIA-APRENDIZAJE-HOME-Y-FOOTER-PARA-NUEVAS-SECCIONES.md** y en **.cursor/rules/patron-contenido-bd-refresh-60s.mdc**.

---

## 3. Módulo de log (content.php)

Para detectar errores enseguida al añadir nuevas secciones, se sigue un criterio único de logs en **content.php**:

### 3.1 Logs ya existentes (mantener)

- **Catch general del PUT:**  
  `error_log('[content.php PUT] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());`  
  y respuesta JSON con el mensaje de la excepción. Así cualquier fallo al guardar (editor) queda registrado y el cliente puede mostrar el mensaje.

### 3.2 Logs recomendados por cada nuevo pageId

- **GET (opcional pero útil):**  
  Tras construir el JSON y antes del `echo`, una línea por pageId:  
  `error_log('[content.php GET ' . $pageId . '] ok');`  
  Si se necesita depurar un campo concreto, añadir por ejemplo:  
  `error_log('[content.php GET ' . $pageId . '] field=' . json_encode($content['field']));`

- **PUT (opcional):**  
  Dentro del bloque `if ($pageId === '...')` del PUT, antes del `foreach` o del `execute`:  
  `error_log('[content.php PUT ' . $pageId . ']');`  
  No es necesario loguear el body completo; el `catch` ya registra el error si algo falla.

### 3.3 Formato y uso

- **Prefijo fijo:** `[content.php GET ...]` y `[content.php PUT ...]` para poder filtrar en el log del servidor (ej. `grep "content.php" error_log`).
- Los logs deben ser **acotados** (una línea por petición o un solo campo extra) para no llenar el log. En caso de error, el detalle viene del `catch`.

Con esto, al implementar una nueva sección se puede ver de un vistazo si el GET/PUT se está llamando y, si hay excepción, el mensaje ya queda registrado.

---

## 4. Uso de este documento y de las reglas Cursor

- **Para un nuevo agente o desarrollador:** Leer primero **docs/GUIA-APRENDIZAJE-HOME-Y-FOOTER-PARA-NUEVAS-SECCIONES.md** (paso a paso y errores a evitar) y este documento (principios y reglas). Las reglas en **.cursor/rules/** (patron-contenido-bd-refresh-60s.mdc, reglas-api-bd-contenido.mdc, cliente-contrato-bd-api.mdc) se aplican en cada cambio de código.
- **Al abrir una tarea “nueva sección desde BD”:** Incluir en el contexto la ruta a la guía de aprendizaje y a este documento para que el agente siga el mismo patrón y use el mismo criterio de logging.
