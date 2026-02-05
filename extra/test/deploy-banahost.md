# Deploy a BanaHost / Bluehost (cPanel + Node.js)

El proyecto está configurado con **adapter Node** (`@astrojs/node`, modo standalone) para desplegar en hostings con cPanel que tengan **Setup Node.js App**.

- **BanaHost:** entorno de pruebas donde validar que todo funcione (formularios, BD, arranque de la app).
- **Bluehost:** es donde el cliente tiene el hosting; el **deploy final** se hace ahí. Los mismos pasos y la misma configuración aplican (cPanel + Setup Node.js App). Lo que quede probado y estable en BanaHost se replica en Bluehost cambiando solo dominio/ruta y credenciales de BD.

---

## Deploy final en Bluehost

Cuando todo funcione en BanaHost, el deploy en **Bluehost** se hace igual:

1. En Bluehost, cPanel suele ofrecer **Setup Node.js App** (o "Node.js Selector"). Si no aparece, ver Opción B (estático + PHP o app en Netlify).
2. Usa la **misma lista "Start over"** de abajo: mismo build (`BASE_PATH` según la URL final, ej. `/` si el sitio va en la raíz del dominio), mismo **Application startup file** (`dist/server/entry.mjs` solo), **Run NPM Install**, variables de entorno de la BD de Bluehost, **RESTART**.
3. Crea en Bluehost la base de datos MySQL y las tablas (misma migración `scripts/migrations/001_create_form_tables.sql` que en BanaHost). Configura `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` en Environment variables de la app Node.
4. Si en Bluehost el panel Node se comporta distinto (p. ej. acepta `node dist/server/entry.mjs` sin error), puedes usar ese formato; si da el error `.../node`, deja solo `dist/server/entry.mjs`.

Conviene **probar bien en BanaHost** (lista Start over, formularios, BD) para no repetir problemas en Bluehost.

---

## URL final: raíz (www.dominio.com) vs subcarpeta (www.dominio.com/wholeselfnm)

**Objetivo real:** El usuario debe poder entrar escribiendo solo **www.ajamoment.com** (o el dominio del cliente), **no** www.ajamoment.com/wholeselfnm. La URL pública tiene que ser la raíz del dominio.

**Qué pasa con la subcarpeta:** En BanaHost el panel no permite usar `public_html` como Application root, así que la app Node tiene que vivir en una subcarpeta (ej. `public_html/wholeselfnm`). Eso hace que **en BanaHost** el sitio quede en **www.ajamoment.com/wholeselfnm**. Eso está bien **solo como entorno de pruebas** para validar formularios, BD y que la app arranque. No es la URL final que quiere el cliente.

**Producción en Bluehost (sitio en la raíz):** Para que el sitio se vea en **www.dominio.com** (sin subcarpeta), hay que hacer una de estas dos cosas:

1. **Probar si Bluehost permite `public_html` como Application root**  
   En Bluehost, al crear la app Node, prueba poner **Application root** = **`public_html`** (y los archivos en la raíz de `public_html`). Algunos cPanel sí lo permiten. Si **no** da error "Directory 'public_html' not allowed", entonces:
   - Subes **package.json**, **package-lock.json** y **dist/** directamente a **public_html**.
   - Application root: **`public_html`**.
   - Application URL: **`/`**.
   - Build en tu PC **sin** base path: `npm run build`.
   - Así el sitio queda en www.dominio.com.

2. **Si Bluehost tampoco permite `public_html`**  
   Entonces la app Node tendría que estar en una subcarpeta y habría que:
   - **Opción A:** Configurar el servidor para que la **raíz del dominio** (/) redirija o haga **proxy** hacia la app Node (p. ej. en un subdirectorio o puerto). Así el usuario escribe www.dominio.com y el servidor sirve la app Node sin que se vea /wholeselfnm en la barra de direcciones. Eso depende de que el hosting permita reglas de proxy (p. ej. en .htaccess o en la config de LiteSpeed/Apache). Hay que revisar la documentación de Bluehost o preguntar a soporte.
   - **Opción B:** Usar la arquitectura alternativa del doc: sitio estático (o en Netlify) en la raíz + formularios vía PHP o API en el mismo hosting. Así la URL pública es la raíz y los formularios se guardan en MySQL sin depender del panel Node.

**Resumen:** En BanaHost usar subcarpeta (/wholeselfnm) es correcto **solo para pruebas**. Para producción en Bluehost el objetivo es **www.dominio.com** (raíz); primero intentar Application root = `public_html` en Bluehost; si no lo permiten, valorar proxy en la raíz o la Opción B del documento.

---

## ¿Start over o otra opción?

- **Quieres intentar de nuevo en BanaHost** → Sigue la **lista "Start over"** más abajo (una sola secuencia con lo que ya sabemos que evita los errores que tuviste). Si tras seguirla al pie de la letra sigue fallando, el límite suele estar en cómo BanaHost/LiteSpeed lanzan la app; en ese caso tiene sentido pasar a la alternativa.
- **Prefieres no seguir con Node en BanaHost** → Mira la **Opción B** al final: app en Netlify (o similar) + BD en BanaHost, o sitio estático en BanaHost + PHP para los formularios. Ambas son válidas y evitan depender del panel Node de BanaHost.

---

## Start over — lista única (BanaHost o Bluehost Node)

Esta lista hay que **probarla bien** en BanaHost; cuando funcione, se usa igual para el deploy final en Bluehost (solo cambian dominio, ruta y credenciales de BD). Si vas a borrar la app actual y crear de cero (o reconfigurar todo), haz **exactamente** esto y en este orden:

1. **En tu PC:** Build con base path según la URL final. En BanaHost (subpath): `$env:BASE_PATH="/wholeselfnm/"; npm run build`. En Bluehost si el sitio va en la raíz: `npm run build` (sin BASE_PATH). Sube **package.json**, **package-lock.json** y **dist/** a una **subcarpeta** dentro de `public_html` (ej. **public_html/wholeselfnm**). **No pongas los archivos en la raíz `public_html`** si vas a usar Setup Node.js App: el panel no suele permitir usar `public_html` como Application root (ver error más abajo).
2. **En cPanel → Setup Node.js App:** Si la app ya existe, edítala (lápiz). Si no, **+ CREATE APPLICATION**.
3. **Node.js version:** **20** (nunca 10).
4. **Application mode:** **Production**.
5. **Application root:** **`public_html/wholeselfnm`** (o la subcarpeta donde subiste los archivos). **No uses solo `public_html`**: en BanaHost y en muchos cPanel aparece *"Directory 'public_html' not allowed"*. Siempre usa una subcarpeta, p. ej. `public_html/wholeselfnm`.
6. **Application URL:** dominio (ej. **ajamoment.com** en pruebas, dominio del cliente en Bluehost) y ruta: **`/wholeselfnm`** si la app está en la carpeta wholeselfnm; **`/`** si la app está en la raíz (archivos en `public_html`, sin subcarpeta). En Bluehost suele usarse **`/`** cuando el sitio va en la raíz del dominio.
7. **Application startup file:** **solo** **`dist/server/entry.mjs`** (sin la palabra `node`, sin espacios). Es crítico: si pones `node dist/server/entry.mjs` el panel buscará un archivo llamado "node" y dará error.
8. **SAVE**.
9. **Run NPM Install** — espera a que termine (instala `node_modules` y evita el error de `@astrojs/internal-helpers`).
10. **Environment variables:** ADD VARIABLE para `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (valores reales). **SAVE**.
11. **RESTART**.
12. Probar en el navegador: `https://ajamoment.com/wholeselfnm` (o tu URL).

Si después de esto el log sigue mostrando `.../wholeselfnm//node` o 503, es muy probable que el panel no permita usar solo el script en "Application startup file"; en ese caso la opción viable es **Opción B** (app en otro sitio o estático + PHP).

---

## Paso 0 — ¿Qué ofrece BanaHost?

En cPanel busca **"Setup Node.js App"** (sección Software / Tools).

**Si aparece** → Sigue la **Opción A** (pasos concretos abajo).  
**Si no hay Node.js** → Ver **Opción B** al final del documento.

---

## Opción A — Setup Node.js App (pasos concretos)

### 1. Build en tu PC

En la raíz del proyecto. **Si la app se verá en un subpath** (ej. `ajamoment.com/wholeselfnm`), haz el build con base path:

**Con subpath (recomendado para BanaHost):**  
PowerShell: `$env:BASE_PATH="/wholeselfnm/"; npm run build`  
CMD: `set BASE_PATH=/wholeselfnm/ && npm run build`

**Sin subpath (raíz del dominio):**  
`npm run build`

Se genera la carpeta **`dist/`** con `dist/server/entry.mjs` (servidor) y `dist/client/` (estáticos).

### 2. Subir archivos a BanaHost

Por **FTP** o **Administrador de archivos** (File Manager) de cPanel, crea una **subcarpeta dentro de `public_html`** (ej. `wholeselfnm` o `wholeself`). No pongas los archivos directamente en la raíz `public_html`: el panel Node no permite usar `public_html` como Application root (error *"Directory 'public_html' not allowed"*). Sube:

- **package.json**
- **package-lock.json**
- **dist/** (toda la carpeta, con `server/` y `client/` dentro)

No subas `node_modules` desde tu PC; en el servidor se instalarán con `npm install`.

### 3. Crear la aplicación en Setup Node.js App (WEB APPLICATIONS)

El panel muestra algo así: **Node.js version** (desplegable), **Application mode** (desplegable), **Application root** (campo de texto vacío), **Application URL** (dominio + campo de texto) y **Application startup file** (campo de texto vacío). Rellena así:

1. En cPanel, entra a **Setup Node.js App**.
2. Clic en **+ CREATE APPLICATION** (pestaña "Web Applications").
3. En la pantalla de creación:

   - **Node.js version** (desplegable):  
     El panel puede venir con **10.24.1** por defecto. **Cámbialo**: abre el desplegable y elige **18** o **20**. Este proyecto necesita Node 18+.
   - **Application mode** (desplegable):  
     Deja o elige **Production** (el panel lo usa para `NODE_ENV`).
   - **Application root** (campo de texto, suele estar vacío y marcado como obligatorio):  
     Es la ruta en el servidor de la carpeta donde están `package.json` y `dist/`.  
     **Escribe:** **`public_html/wholeselfnm`** si subiste los archivos a una carpeta `wholeselfnm` dentro de `public_html`. **No pongas solo `public_html`**: el panel mostrará *"Directory 'public_html' not allowed"*. Siempre usa una subcarpeta (ej. `public_html/wholeselfnm`). Si en File Manager la ruta es otra (p. ej. solo `wholeselfnm`), usa esa misma. Para ruta absoluta: `/home/tu_usuario_cpanel/public_html/wholeselfnm`.
   - **Application URL**:  
     Suele haber un desplegable con **ajamoment.com** y otro campo de texto. En el campo de texto pon la parte de ruta, por ejemplo **`/wholeselfnm`**, para que la app se vea en `ajamoment.com/wholeselfnm`. Si el panel pide la URL completa, **`ajamoment.com/wholeselfnm`**.
   - **Application startup file** (campo de texto vacío):  
     En BanaHost (LiteSpeed) el panel suele usar solo la **ruta del script**; si pones `node dist/server/entry.mjs`, puede interpretar "node" como ruta y dar error *"Cannot find module '.../wholeselfnm//node'"*.  
     **Prueba en este orden:**  
     1) **Solo el script:** **`dist/server/entry.mjs`** (sin la palabra `node`).  
     2) Si no arranca, si el panel tiene **"Run JS script"** o un desplegable de scripts de package.json, elige **Start script** o **`npm start`** (que ejecuta `node ./dist/server/entry.mjs`).

4. Guarda / crea la aplicación.

**Ejemplo de cómo deben quedar los campos:**

| Campo                    | Valor                             |
|--------------------------|-----------------------------------|
| Node.js version          | **18** o **20** (no 10.24.1)      |
| Application mode         | **Production**                    |
| Application root         | **`public_html/wholeselfnm`**     |
| Application URL (ruta)   | **`/wholeselfnm`**                |
| Application startup file | **`dist/server/entry.mjs`** (solo el script; ver texto arriba si da error) |

---

#### Qué verás después de crear la aplicación

Al darle a crear, el panel te lleva a la pantalla de **WEB APPLICATIONS** de tu app. Verás:

1. **Arriba:** el identificador de la app (ej. **AJAMOMENT.COM/WHOLESELFNM**), con botones **DESTROY**, **CANCEL** y **SAVE**. Si cambias algo, guarda con **SAVE**.
2. **Banner azul:** un mensaje para “entrar al entorno virtual” con un comando largo (ej. `source /home/.../nodevenv/public_html/wholeselfnm/10/bin/activate && cd /home/.../public_html/wholeselfnm`). Ese comando sirve si más adelante entras por **SSH**; por ahora no hace falta usarlo.
3. **Controles de la app:** donde pone **Node.js** aparecen **STOP APP** (parar) y **RESTART** (reiniciar). Usa **RESTART** después de instalar dependencias o de cambiar variables de entorno.
4. **Detected configuration files:** el panel muestra **package.json** (enlace **Edit** para ver/editar el archivo) y dos botones:
   - **Run NPM Install** — instala las dependencias (`node_modules`) en el servidor. **Haz clic aquí primero** después de crear la app (y cada vez que cambies de versión de Node o subas un nuevo `package.json`).
   - **Run JS script** — ejecuta un script de tu `package.json` (suele mostrar un desplegable: start, build, etc.). Puedes usarlo para probar el script **start** en lugar del campo "Application startup file"; no sustituye a **RESTART** para dejar la app corriendo en producción.

**Siguiente paso:** instalar dependencias (paso 4).

---

### 4. Instalar dependencias en el servidor

En esa misma pantalla (donde dice "Detected configuration files"), haz clic en el botón **Run NPM Install**. El panel ejecutará `npm install` en la carpeta de la app y creará `node_modules` en el servidor. Espera a que termine.

### 5. Variables de entorno (base de datos)

En la misma página de tu aplicación (scroll si hace falta) busca la sección **Environment variables**. Haz clic en **ADD VARIABLE**.

Aparecerá una fila con dos campos:
- **Name** (nombre de la variable): escribe exactamente el nombre, por ejemplo `DB_HOST`.
- **Value** (valor): escribe el valor correspondiente (ej. `localhost`).
- **DONE** — guarda esa variable. **CANCEL** — descarta y no la añade.

Repite **ADD VARIABLE** para cada variable. Añade estas cuatro (con los valores reales de tu MySQL en BanaHost; **nunca** los subas al repo):

| Name         | Value (ejemplo)        |
|--------------|------------------------|
| `DB_HOST`    | `localhost`            |
| `DB_USER`    | tu_usuario_mysql       |
| `DB_PASSWORD`| tu_contraseña_mysql    |
| `DB_NAME`    | nombre_de_tu_bd        |

Si prefieres una sola variable, usa **Name** = `DATABASE_URL` y **Value** = `mysql://usuario:contraseña@localhost:3306/nombre_bd`.

Después de añadir todas, guarda los cambios de la página (**SAVE** si aparece).

### 6. Arrancar o reiniciar la app

En la página de tu aplicación (WEB APPLICATIONS), donde indica **Node.js**, verás los botones **STOP APP** y **RESTART**. Haz clic en **RESTART** para arrancar o reiniciar la app (si estaba parada, RESTART la pone en marcha). El servidor quedará escuchando en el puerto que asigne BanaHost.

### 7. Probar

- Abre la **Application URL** en el navegador (tu dominio).
- Envía uno de los 4 formularios.
- En **phpMyAdmin**, revisa la tabla correspondiente (`form_contact`, `form_referral`, etc.) y confirma que se guardó el registro.

Si algo falla, revisa los **logs** de la aplicación en Setup Node.js App (o en "Logs" / "Error log" del panel).

---

### Error "Directory 'public_html' not allowed"

Si al crear la aplicación en Setup Node.js App aparece **"Directory 'public_html' not allowed"** (o similar), es porque el panel **no permite** usar la carpeta raíz `public_html` como **Application root**. Es una restricción habitual en cPanel/BanaHost/Bluehost.

**Solución:** Usa siempre una **subcarpeta** de `public_html`:

1. En **File Manager** (o por FTP), crea una carpeta dentro de `public_html`, por ejemplo **`wholeselfnm`** (o `wholeself`, `app`, etc.).
2. Mueve o sube ahí **package.json**, **package-lock.json** y la carpeta **dist/** (no dejes los archivos en la raíz de `public_html`).
3. En Setup Node.js App, en **Application root** escribe **`public_html/wholeselfnm`** (o el nombre de la subcarpeta que hayas usado).
4. En **Application URL** pon la ruta que corresponda, por ejemplo **`/wholeselfnm`**, para que el sitio se vea en `tudominio.com/wholeselfnm`.
5. Haz el build en tu PC con base path: `$env:BASE_PATH="/wholeselfnm/"; npm run build` y vuelve a subir la carpeta **dist/** a esa subcarpeta.

Así evitas el error y la app podrá crearse correctamente.

---

### Si ves "503 Service Unavailable" (la app no arranca)

Ese mensaje significa que el proxy no puede conectar con tu app Node: la app no está corriendo o se cae al iniciar. Sigue estos pasos:

1. **Dónde está el log**  
   En la lista de **WEB APPLICATIONS** no suele verse el log. Entra al detalle de la app: haz clic en el **nombre/URI** de la app (ej. `ajamoment.com/wholeselfnm`) o en el **icono del lápiz (Edit)**. En la página de configuración de esa app, baja o busca una sección **"Log"**, **"Application log"**, **"Error log"** o **"Metrics"** (a veces el log está ahí). Si no aparece en ningún lado, BanaHost puede no mostrar logs en el panel; en ese caso sigue con el punto 2.

2. **Comprobar versión de Node.js (muy importante)**  
   En la lista de aplicaciones el estado puede decir **started (v10.24.1)**. Eso significa que la app está corriendo con **Node 10**, que es demasiado antigua para este proyecto y suele producir 503.  
   **Solución:** haz clic en el **lápiz (Edit)** de tu app → en **Node.js version** cambia a **18** o **20** → **SAVE** → ejecuta **Run NPM Install** de nuevo → **RESTART**. Luego prueba otra vez la URL.

3. **Error "Cannot find module '.../wholeselfnm//node'"**  
   Ese error significa que el panel (LiteSpeed) está tomando la palabra **node** del comando como si fuera una ruta de archivo. **Solución:** en **Application startup file** pon **solo** **`dist/server/entry.mjs`** (sin `node` delante). El panel usará el Node de la versión elegida para ejecutar ese script. Guarda y **RESTART**. Si el panel tiene opción de script de package.json, usa **Start script** / **npm start** en su lugar.

4. **Comprobar que la app está en marcha**  
   En la página de la app debe aparecer **Running** / **Started**. Si está **Stopped**, haz clic en **RESTART**.

5. **Confirmar Run NPM Install**  
   Si **Run NPM Install** no se ejecutó bien o no se hizo, no existirá `node_modules` y verás en el log algo como "Cannot find module". Vuelve a hacer **Run NPM Install**, espera a que termine sin errores, y luego **RESTART**.

6. **Reiniciar después de cambiar variables**  
   Si añadiste o cambiaste variables de entorno, haz **SAVE** y después **RESTART** para que la app cargue los nuevos valores.

**Siguiente paso:** cuando tengas el mensaje de error del log (p. ej. "Cannot find module 'X'", "SyntaxError", "ECONNREFUSED"), compártelo y se puede concretar la solución.

---

### Error "Cannot find module '.../wholeselfnm//node'"

Si en el log ves **Cannot find module '/home/.../public_html/wholeselfnm//node'**, el panel (LiteSpeed) está usando **"node"** como ruta de archivo en lugar del ejecutable.

**Solución:** Edita la aplicación (lápiz) → en **Application startup file** deja **solo** **`dist/server/entry.mjs`** (sin la palabra `node`, sin espacios). Si hay otro campo tipo "Node path" o "Interpreter", déjalo vacío o quita "node". **SAVE** y **RESTART**.

---

### Error "Cannot find package 'react'" o "Cannot find package '@astrojs/internal-helpers'"

Si en el log aparece **ERR_MODULE_NOT_FOUND** para **`react`** o **`@astrojs/internal-helpers`** (importados desde `dist/server/renderers.mjs` o chunks de Astro), en el servidor **no está** o está incompleto **node_modules** en la carpeta de la app. Si ya hiciste `npm install` por Terminal y solo se instalaron ~20 paquetes, el servidor está en modo producción y no instaló **devDependencies**; el código del servidor necesita paquetes como `@astrojs/internal-helpers` (vienen con astro). Solución: en la Terminal, con el entorno de Node activado, ejecuta **`NODE_ENV=development npm install`** (o borra `node_modules`, luego `NODE_ENV=development npm install`) y después **RESTART**.

**Por qué ves un icono de “enlace” en `node_modules`:** En el File Manager, si **node_modules** muestra un **icono de cadena/enlace** (🔗), no es una carpeta normal: es un **symlink** (enlace simbólico). El panel “Run NPM Install” a veces crea ese enlace apuntando a otra ruta del servidor en lugar de crear una carpeta con los archivos. Si el enlace está roto, apunta a una ruta vacía o el servidor no lo resuelve bien, Node no encuentra `react` ni el resto de paquetes. No falta ningún paso tuyo: es cómo funciona el panel en este hosting.

**Qué hacer (en este orden):**

1. **Comprobar en File Manager:** Entra en la carpeta de la app (ej. **public_html/wholeselfnm**). Si **node_modules** tiene icono de enlace o pesa muy poco, sigue el paso 2 o 3.
2. **Probar de nuevo Run NPM Install:** Borra por completo la carpeta **node_modules** en el servidor (clic derecho → Delete). En Setup Node.js App → tu aplicación → **Run NPM Install**. Espera a que termine. Luego **RESTART**. Si tras esto `node_modules` sigue siendo un enlace roto o vacío, pasa al paso 3.
3. **Instalar dependencias manualmente (recomendado cuando el symlink falla):** Usa **SSH** o la **Terminal de cPanel** (cPanel → Terminal o “Advanced” → Terminal).

   **Si en la Terminal sale "npm: command not found":** En cPanel la Terminal no tiene `npm` en el PATH; hay que **activar el entorno de Node**. En **Setup Node.js App** → tu aplicación, arriba suele haber un **banner azul** con un comando tipo `source /home/.../nodevenv/.../20/bin/activate && cd /home/.../wholeselfnm`. **Copia y ejecuta ese comando** en la Terminal; después de eso `npm` y `node` funcionarán. Luego ejecuta:

   ```bash
   cd /home/koxwefbs/public_html/wholeselfnm/
   rm -rf node_modules
   NODE_ENV=development npm install
   ```

   **Importante:** Usa **`NODE_ENV=development npm install`** (no solo `npm install`). En el servidor, cPanel suele tener `NODE_ENV=production`, y entonces npm solo instala `dependencies` y omite `devDependencies`. El código del servidor (dist/server) necesita paquetes que están en devDependencies (p. ej. `@astrojs/internal-helpers`, que viene con astro). Si instalas solo con `npm install` y sigue el error "Cannot find package '@astrojs/internal-helpers'", borra `node_modules`, ejecuta **`NODE_ENV=development npm install`** y luego **RESTART**.

   (Ajusta la ruta si tu carpeta es otra, p. ej. `/home/tu_usuario/public_html/wholeselfnm`.) Si da error de permisos con los binarios, prueba `NODE_ENV=development npm install --no-bin-links`. Después, en Setup Node.js App → **RESTART**.

4. **RESTART** siempre después de instalar dependencias.

Si **Application root** en el panel no es exactamente la carpeta donde están `package.json` y `dist/`, el panel puede estar instalando en otra ruta; comprueba que coincida (ej. **public_html/wholeselfnm**).

---

### Referencia: cPanel / BanaHost y node_modules (symlinks)

En hostings con cPanel (BanaHost, Bluehost, etc.) que usan **Setup Node.js App** o **NodeJS Selector** (CloudLinux), suele ocurrir lo siguiente:

- El sistema a veces guarda las dependencias en **otra carpeta** (p. ej. dentro del entorno virtual de Node) y crea un **symlink** (enlace simbólico) de `node_modules` en la carpeta de tu app. En el File Manager verás **node_modules** con un **icono de cadena/enlace** (🔗): es ese symlink. Si el enlace queda vacío o roto, Node no resuelve los paquetes y aparece **ERR_MODULE_NOT_FOUND** (react, @astrojs/internal-helpers, etc.). No es que hayas omitido un paso; es el comportamiento del panel.
- **Recomendación documentada en soporte cPanel:** si ya existe una carpeta `node_modules` en la raíz de la aplicación, **borrarla o renombrarla** antes de pulsar **Run NPM Install**. Así el panel puede crear de nuevo la estructura (o el symlink) correctamente.
- **Orden recomendado:** (1) Subir `package.json`, `package-lock.json` y `dist/` **sin** carpeta `node_modules`. (2) Crear la aplicación en Setup Node.js App y configurarla. (3) Ejecutar **Run NPM Install** una sola vez y esperar a que termine. (4) Si más adelante `node_modules` aparece con tamaño mínimo o symlinks rotos, borrarlo por completo y volver a **Run NPM Install**.
- Si el hosting permite **SSH** o tiene **Terminal** en cPanel, entra a la carpeta de la app, borra `node_modules` (`rm -rf node_modules`) y ejecuta **`npm install`** (o `npm install --no-bin-links` si hay errores de permisos). Así se crea una carpeta **real** con los paquetes, no un symlink, y el error "Cannot find package 'react'" suele desaparecer.
- **Dependencias en producción:** los paquetes que la app usa al ejecutarse (react, astro, mysql2, etc.) deben estar en **dependencies** en `package.json`, no solo en devDependencies, para que **Run NPM Install** en modo producción los instale.

*Referencias: cPanel Support (MODULE_NOT_FOUND, Node.js), documentación cPanel “How to Install a Node.js Application”, guías de despliegue Node.js en hosting con cPanel.*

---

### ¿Y si subo node_modules por FTP?

**No es recomendable.** Motivos:

1. **Tamaño y tiempo:** `node_modules` suele pesar cientos de MB y tiene miles de archivos pequeños. Subir todo por FTP es muy lento y suele dar timeouts o fallos a mitad.
2. **Tu PC es Windows y el servidor es Linux:** Paquetes con **módulos nativos** (como **mysql2**, que usa este proyecto) se compilan para el sistema donde haces `npm install`. Los binarios generados en Windows no sirven en Linux: al arrancar la app en el servidor verás errores del tipo "wrong ELF" o "module did not self-register". Esos paquetes **tienen que instalarse en el propio servidor** (con Run NPM Install o `npm install` por SSH).
3. **Symlinks:** En Windows la estructura de `node_modules` no es idéntica a la de Linux; npm puede usar junctions o copias. Subir esa estructura no garantiza que el servidor la interprete bien.

**Qué hacer en su lugar:** Mantener el flujo de la lista "Start over": subir solo **package.json**, **package-lock.json** y **dist/**, borrar `node_modules` en el servidor si existe, y usar **Run NPM Install** (o SSH + `npm ci --omit=dev` si el hosting lo permite). Si Run NPM Install sigue fallando (symlinks rotos, etc.), la opción viable es contactar al hosting, usar SSH si está disponible, o valorar la **Opción B** (app en Netlify + BD en el hosting, o estático + PHP para formularios).

---

### Si sigue 503 con Node 20 y status "started"

Cuando el panel ya muestra **started (v20.x)** pero la URL sigue dando 503, suele ser proxy o rutas. Prueba en este orden:

1. **Comprobar archivos en el servidor**  
   En cPanel → **File Manager** → entra en **public_html/wholeselfnm**. Tiene que haber: **package.json**, carpeta **dist/** (con **dist/server/entry.mjs** y **dist/client/**), y después de Run NPM Install, carpeta **node_modules/**. Si falta **dist/** o **dist/server/entry.mjs**, vuelve a subir la carpeta **dist/** desde tu PC (la generas con `npm run build`).

2. **Comando de arranque**  
   Edita la app (lápiz) y revisa **Application startup file**. Debe ser exactamente: **`node dist/server/entry.mjs`**. Guarda y **RESTART**.

3. **Build con base path para subpath**  
   Si la app se abre en `ajamoment.com/wholeselfnm`, el proxy puede estar enviando las peticiones con esa ruta. Hay que hacer un **build con base path** y volver a subir **dist/**:
   - En tu PC, en la raíz del proyecto, ejecuta:  
     **Windows (PowerShell):** `$env:BASE_PATH="/wholeselfnm/"; npm run build`  
     **Windows (CMD):** `set BASE_PATH=/wholeselfnm/ && npm run build`  
   - Sube de nuevo la carpeta **dist/** al servidor (sustituye la que hay en **public_html/wholeselfnm**).
   - En el panel, **RESTART** de la app.

4. **Parar y arrancar de nuevo**  
   En la lista de aplicaciones, prueba el botón de **Stop** (cuadrado) y después **Start** / **RESTART**, y espera unos segundos antes de abrir la URL.

5. **Soporte del hosting**  
   Si con todo lo anterior sigue 503, puede que el proxy de BanaHost no esté enlazado al puerto de la app. Contacta a BanaHost y comenta que la aplicación Node aparece como "started" pero la URL devuelve 503, y que necesitas que revisen la configuración de proxy para la aplicación en **ajamoment.com/wholeselfnm**.

---

## Si Node en BanaHost no arranca (symlink, @astrojs/internal-helpers, etc.)

Cuando el panel sigue creando `node_modules` como symlink y/o no instala bien las dependencias aunque hagas `NODE_ENV=development npm install` por Terminal, el despliegue Node en BanaHost se vuelve poco práctico. Tiene sentido pasar a una **alternativa** (Opción B más abajo) en lugar de seguir depurando el panel.

---

## Actualizaciones del sitio: ¿hay que repetir todo el proceso?

- **Si el sitio estuviera funcionando con Node en BanaHost:** Para **cambios de contenido** (textos, imágenes, páginas) normalmente bastaría: (1) en tu PC `npm run build` con el mismo `BASE_PATH`, (2) subir por FTP solo la carpeta **dist/** al servidor, (3) **RESTART** en Setup Node.js App. No haría falta volver a tocar `node_modules` a menos que cambies dependencias en `package.json`. En la práctica sería “build → subir dist → RESTART”.
- **Si usas Netlify (Opción B1):** Actualizaciones = subir código (git push o arrastrar build a Netlify). Netlify hace el build en sus servidores; no subes `node_modules` ni ejecutas nada manual en BanaHost para la app.
- **Si usas estático + PHP (Opción B2):** Actualizaciones = en tu PC `npm run build` (estático), subir por FTP la carpeta generada a `public_html`. Los formularios siguen apuntando al PHP en BanaHost. No hay Node ni `node_modules` en el servidor.

---

## Opción B — Alternativas cuando Node en BanaHost no funciona

Cuando el panel Node (symlink, dependencias, etc.) no permite que la app arranque, puedes usar una de estas dos alternativas.

### B1. App en Netlify (o similar) + BD en BanaHost

- La **app** (Astro; puedes usar adapter para Netlify o estático) se despliega en **Netlify** (o Vercel, etc.). Dominio: el que te da Netlify o tu dominio conectado por DNS a Netlify.
- **Actualizaciones:** Subes el código (git push o drag-and-drop del build). Netlify hace el build; no tocas Node ni FTP en BanaHost.
- **Base de datos:** La BD sigue en BanaHost. Para que Netlify pueda conectarse, en BanaHost hay que habilitar **Remote MySQL** (o “Conexiones remotas a MySQL”) y autorizar las IP de Netlify (o “%” solo para pruebas). Si BanaHost no permite conexiones remotas, esta opción no sirve para la BD; en ese caso la BD tendría que estar en un servicio que permita acceso externo (ej. plan MySQL en la nube).
- **Resumen:** Sitio y lógica en Netlify; formularios envían a APIs/Serverless de Netlify que escriben en la BD de BanaHost (si Remote MySQL está abierto) o en otra BD accesible desde internet.

### B2. Sitio estático en BanaHost/Bluehost + PHP para los formularios

- El proyecto pasa a **export estático** (`output: 'static'` en Astro, sin adapter Node). En tu PC: `npm run build`; se genera una carpeta con solo HTML/JS/CSS.
- Subes esa carpeta por **FTP** a **public_html** (o subcarpeta, ej. `public_html/redesigned`). El sitio se ve en tu dominio sin usar Node en el servidor.
- Los **formularios** no pueden usar las APIs Node actuales. Se crean **scripts PHP** en el hosting que reciben el POST de cada formulario y escriben en las mismas tablas MySQL (mismo esquema `001_create_form_tables.sql`). En el front, los formularios envían a URLs PHP (ej. `https://tudominio.com/api/forms/contact.php`).
- **Base de datos:** Todo en el mismo servidor (Bluehost): MySQL incluido en el plan, PHP incluido. No hace falta Remote MySQL ni servicios externos.
- **Actualizaciones:** Cambias contenido → `npm run build` en tu PC → subes por FTP la carpeta generada. No hay `node_modules` ni RESTART.

---

## Bluehost: ¿Netlify o sitio estático + PHP? (comparación y costes)

**¿Cuál es más fácil?**

- **Sitio estático + PHP en Bluehost** suele ser más fácil en tu caso: todo en un solo lugar (sitio, BD y formularios en Bluehost). No configuras DNS hacia Netlify ni Remote MySQL. La BD está en el mismo servidor que el PHP; no hay conexiones remotas.
- **Netlify** es fácil para publicar el sitio (conectar repo o subir build), pero para usar la **BD en Bluehost** desde Netlify necesitas que Bluehost permita **Remote MySQL** y autorice las IP de Netlify. En planes shared eso a veces no está o es limitado; entonces la BD tendría que estar en otro servicio (Supabase, PlanetScale, etc.).

**¿Netlify tiene coste?**

El **plan gratuito** de Netlify suele bastar para un sitio pequeño. Esto es lo que significa en la práctica:

- **Ancho de banda (100 GB/mes):** Es el tráfico que “consumen” las visitas a tu sitio: cada vez que alguien carga una página, se descargan HTML, CSS, JS e imágenes desde los servidores de Netlify. Ese total cuenta para el límite.  
  **Ejemplo:** Si cada visita “pesa” unos 2 MB (páginas + recursos), 100 GB ≈ 50.000 visitas al mes. Para un sitio como wholeselfnm (clínica, no tienda masiva) es más que suficiente; estarías en **$0**.

- **Minutos de build (300 min/mes):** Cada vez que Netlify ejecuta un build cuenta como un **despliegue**. Eso ocurre cuando haces **push** al repo conectado (cualquier cambio: actualización de texto, contenido nuevo, corrección, etc.) o cuando lanzas un deploy manual desde el panel. Netlify corre `npm run build` en sus servidores y ese tiempo se cuenta en minutos.  
  **Ejemplo:** Si un build tarda 2 minutos y haces 10 despliegues al mes (p. ej. 10 pushes con cambios), son 20 minutos de 300. Quedarías muy por debajo del límite; de nuevo **$0**.

- **¿Por sitio o por cuenta?** Los 100 GB y los 300 min de build aplican a **toda la cuenta** de Netlify, no a cada repo por separado. Es decir: todos los sitios que tengas conectados a la misma cuenta (GitHub → Netlify) **comparten** ese total. Si tienes otro repositorio ya conectado, su tráfico y sus builds **se suman** al mismo límite. Para saber si sigues en $0, revisa el uso global de la cuenta en el panel de Netlify (uso de ancho de banda y de build minutes).

- **Resumen:** Para un sitio como wholeselfnm (pocas actualizaciones y tráfico normal), el plan gratuito suele ser **$0**. Si ya usas Netlify con más sitios, el consumo de todos se suma; si el total sigue por debajo de 100 GB y 300 min, sigues en gratis. Si te pasas, Netlify ofrece planes de pago.

**Qué tener en cuenta**

| | Estático + PHP (Bluehost) | Netlify |
|--|---------------------------|---------|
| **BD en Bluehost** | Sí, sin problema. PHP y MySQL en el mismo servidor. | Solo si Bluehost permite Remote MySQL y autorizas IP (o %). En shared a menudo no. Si no, BD en otro servicio (Supabase, etc.). |
| **Coste extra** | $0 (todo en el plan actual). | $0 con plan free si no te pasas de límites. |
| **Actualizaciones** | Build en PC → subir por FTP la carpeta estática. | git push o subir build; Netlify hace el build. |
| **Formularios** | 4 scripts PHP en Bluehost que escriben en MySQL. | Netlify Functions (o similar) que escriben en BD (Bluehost si hay Remote MySQL, o BD externa). |

**Recomendación para Bluehost (plan shared, sin Node):** Usar **estático + PHP**: sitio en `public_html/redesigned` (o donde quieras), BD MySQL en Bluehost, 4 scripts PHP que reciben los POST y guardan en las tablas. Sin coste extra y sin depender de Remote MySQL.

---

## Guía rápida: Bluehost — sitio estático + PHP (pasos)

Cuando el plan es shared (ej. WordPress Choice Plus) y no hay Node.js en cPanel:

1. **BD en Bluehost:** En cPanel → MySQL® Databases: crear base de datos y usuario; ejecutar el script `scripts/migrations/001_create_form_tables.sql` (las 4 tablas: form_contact, form_referral, form_i_need_help, form_loved_one).

2. **Proyecto en estático:** En `astro.config.mjs`: quitar el adapter Node, poner `output: 'static'`, y `base: '/redesigned/'` (o la subcarpeta que uses). Build: `npm run build`. Subir por FTP a **public_html/redesigned** el contenido de **dist/** (o la carpeta que genere Astro para estático).

3. **Scripts PHP:** Crear en el servidor, por ejemplo en **public_html/api/forms/**, 4 archivos PHP que reciban POST (JSON o form-data), validen y escriban en MySQL (mismas columnas que las tablas del SQL). Ejemplo de nombres: `contact.php`, `referral.php`, `i-need-help.php`, `loved-one-needs-help.php`. Cada uno devuelve JSON `{ "ok": true }` o `{ "ok": false, "error": "..." }`.

4. **Front: URLs de los formularios:** En el código del sitio (ContactForm.tsx y los 3 .astro de contact), cambiar la URL del `fetch`: en vez de `/api/forms/contact` usar la URL absoluta del PHP, por ejemplo `https://wholeselfnm.com/api/forms/contact.php` (o la base que corresponda si el sitio está en subcarpeta). Así los envíos van al PHP en Bluehost y se guardan en la BD.

5. **Actualizaciones:** Cada vez que cambies el proyecto (texto, código, páginas nuevas, etc.): (1) en tu PC ejecuta `npm run build` (siempre es un build completo; no hay “build solo de una página”), (2) por FTP subes a Bluehost la carpeta generada (contenido de `dist/`) a `public_html/redesigned`, reemplazando la anterior. Solo subes el resultado del build, no código fuente ni `node_modules`. No hace falta tocar los PHP ni la BD salvo que cambies formularios o el esquema. **Nota:** Algunos clientes FTP permiten “sincronizar” o subir solo archivos modificados, lo que puede acortar la subida; aun así el build sigue siendo completo.

---

## Resumen

1. **Tienes Setup Node.js App** → Opción A: build, subir `package.json`, `package-lock.json` y `dist/`, crear app, Run NPM Install, variables de BD, Start.
2. **No hay Node.js** → Opción B (Netlify + BD remota o estático + PHP).

**Referencia**: [Plan de acción migración](plan-accion-migracion-bluehost.md) (Pasos 9 y 10) | [Guía deploy Bluehost](../planes/guia-deploy-bluehost.md).  
**Deploy estático en Bluehost (sin Node):** [Deploy estático a Bluehost](deploy-estatico-bluehost.md).
