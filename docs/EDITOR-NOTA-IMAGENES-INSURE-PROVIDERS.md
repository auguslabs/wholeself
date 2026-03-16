# Nota para el editor: imágenes de aseguradoras (Rates)

**Para:** equipo del editor (Augushub).  
**Asunto:** Cómo cargar y mostrar las imágenes de los logos de aseguradoras en vuestra interfaz.

---

## El problema

Si las imágenes de los proveedores de insurance no se ven en el editor, es porque la API devuelve solo un **path** (ruta relativa), no una URL completa. El navegador necesita una URL absoluta para cargar la imagen.

## Qué hacer

1. **Al recibir los datos (GET `/api/content/rates`):**  
   Para cada ítem de `content.insurance.providerList`, el campo `logoUrl` viene como string, por ejemplo:
   - `"/uploads/insurance/aetna.svg"`
   - `"/uploads/insurance/united-healthcare.png"`
   - o `""` si no hay logo.

2. **Para mostrarla en el editor:**  
   Construid la URL absoluta así:
   - **Origen del sitio** = dominio donde está el sitio/API (ej. `https://www.wholeselfnm.com`).
   - **URL de la imagen** = `origen + logoUrl`  
     Ejemplo: `https://www.wholeselfnm.com` + `/uploads/insurance/aetna.svg` →  
     `https://www.wholeselfnm.com/uploads/insurance/aetna.svg`

3. **Código sugerido:**  
   `imageSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : origin + (logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl)) : ''`  
   Usad `imageSrc` en el `src` del `<img>` de la previsualización del logo.

4. **Rutas unificadas (ajuste reciente):**  
   Todas las imágenes del sitio usan la base **`/uploads/`**:
   - Logos de aseguradoras: **`/uploads/insurance/<archivo>.<ext>`**
   - Imágenes hero (Home, Rates, Services): **`/uploads/hero/<página>.webp`**

5. **Al guardar (PUT):**  
   Si permitís subir una nueva imagen, guardad en `logoUrl` el **path** que os devuelva vuestro endpoint (ej. `/uploads/insurance/nuevo-logo.png`), no la URL absoluta.

---

**Resumen:** La API devuelve **path**; en el editor hay que convertirlo en **URL absoluta** (origen del sitio + path) para que el `<img src="...">` cargue la imagen.

Documentación detallada: `docs/RATES-INSURANCE-LOGOS-EDITOR.md`.
