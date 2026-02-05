# Deploy solo cambios: rsync y flujo profesional

Documento de referencia para implementar despliegue por sincronización (solo subir lo que cambió) en lugar de subir todo el `dist/` con FileZilla.

---

## 1. Situación actual

- Hacemos cambios menores en el código.
- Ejecutamos `npm run build` (correcto).
- Subimos **todo** el proyecto/sitio con FileZilla.
- En un proyecto grande, subir todo cada vez sería muy lento.

---

## 2. Cómo se hace a nivel profesional

- **No se sube “todo a mano”**: se usa **sincronización** o **automatización**.
- **Rsync**: se sincroniza la carpeta `dist/` local con la del servidor. Solo se envían archivos que cambiaron (y solo las diferencias).
- **CI/CD**: al hacer push a Git, un pipeline hace el build y el deploy (rsync, SFTP o API del host). No se usa FileZilla.
- **Hosting con Git**: Netlify, Vercel, Cloudflare Pages: conectas el repo, ellos hacen build y despliegan; no hay FTP.

---

## 3. En nuestro caso (build local + subir a hosting vía FTP/SFTP)

La forma profesional y práctica es:

1. Seguir haciendo `npm run build`.
2. **Sincronizar** `dist/` con el servidor (rsync) en lugar de “subir todo”.
3. Solo se transfiere lo que realmente cambió; la primera vez será todo, después solo diferencias.

---

## 4. Requisitos para usar rsync en Windows

- **Opción A – WSL (recomendado)**  
  - Windows Subsystem for Linux.  
  - Instalar: `wsl --install` (o desde “Activar características de Windows”).  
  - En la terminal WSL ya tienes `rsync` disponible.

- **Opción B – Git Bash**  
  - Viene con Git for Windows.  
  - Abrir “Git Bash” y usar `rsync` (a veces hay que habilitarlo o usar la ruta de Git).

---

## 5. Comandos rsync de referencia

### Sincronizar `dist/` con el servidor (solo cambios)

```bash
# Desde la raíz del proyecto (donde está dist/)
# Reemplaza: USUARIO, SERVIDOR, RUTA_REMOTA

rsync -avz --delete ./dist/ USUARIO@SERVIDOR:/ruta/en/servidor/
```

- `-a`: modo archivo (permisos, fechas).
- `-v`: verbose.
- `-z`: compresión en la transferencia.
- `--delete`: borrar en el servidor lo que ya no está en `dist/` (el sitio queda igual que tu build).

### Si el hosting usa SFTP (puerto 22 u otro)

```bash
rsync -avz --delete -e "ssh -p PUERTO" ./dist/ USUARIO@SERVIDOR:/ruta/remota/
```

Ejemplo con puerto 22 (por defecto):

```bash
rsync -avz --delete -e "ssh -p 22" ./dist/ usuario@tuservidor.com:/home/usuario/public_html/
```

### Ejemplo con Bluehost / cPanel (SFTP)

- Host: `tu-dominio.com` o el host SFTP que te den (ej. `box123.bluehost.com`).
- Usuario: tu usuario cPanel.
- Ruta típica: `/home/usuario/public_html/` (o la carpeta donde esté el sitio).
- Puerto: 22 (SFTP) o el que indique el host.

```bash
rsync -avz --delete -e "ssh -p 22" ./dist/ usuario@box123.bluehost.com:/home/usuario/public_html/
```

---

## 6. Script de deploy a implementar

Ubicación sugerida: `scripts/deploy-rsync.sh` (o `scripts/deploy-rsync.bat` si se llama desde PowerShell/CMD a WSL).

El script debería:

1. Ejecutar `npm run build`.
2. Si el build termina bien, ejecutar `rsync` de `dist/` al servidor.
3. Usar variables o un archivo de configuración (no subido a Git) para usuario, servidor, ruta y puerto.

Ejemplo de estructura (a rellenar cuando se implemente):

```bash
#!/bin/bash
# scripts/deploy-rsync.sh
# Uso: ./scripts/deploy-rsync.sh
# Requiere: WSL o Git Bash, rsync, acceso SSH/SFTP al servidor

set -e
cd "$(dirname "$0")/.."

echo "Building..."
npm run build

echo "Syncing dist/ to server..."
# Cargar variables desde .env.deploy o aquí (no commitear credenciales)
RSYNC_USER="${DEPLOY_USER:-usuario}"
RSYNC_HOST="${DEPLOY_HOST:-tuservidor.com}"
RSYNC_PATH="${DEPLOY_PATH:-/home/usuario/public_html/}"
RSYNC_PORT="${DEPLOY_PORT:-22}"

rsync -avz --delete -e "ssh -p $RSYNC_PORT" ./dist/ "$RSYNC_USER@$RSYNC_HOST:$RSYNC_PATH"

echo "Deploy done."
```

Variables de entorno sugeridas (en `.env.deploy` o en el sistema, **no en Git**):

- `DEPLOY_USER`: usuario SFTP/SSH.
- `DEPLOY_HOST`: host del servidor.
- `DEPLOY_PATH`: ruta remota (ej. `/home/usuario/public_html/`).
- `DEPLOY_PORT`: puerto SSH (ej. 22).

---

## 7. Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hacer `npm run build` está bien? | Sí. |
| ¿Subir todo el dist con FileZilla cada vez? | Funciona, pero no es lo óptimo en proyectos grandes. |
| Forma profesional | Build local + **rsync** para sincronizar `dist/` al servidor (solo se sube lo que cambió). |
| Próximo paso | Implementar `scripts/deploy-rsync.sh` y (opcional) `.env.deploy.example` con las variables; usar WSL o Git Bash para ejecutar. |

---

## 8. Referencias en este repo

- `extra/test/deploy-estatico-bluehost.md` – deploy estático a Bluehost.
- `extra/test/nota-ftp-cpanel-bluehost.md` – FTP/cPanel Bluehost.
- `extra/test/ci-cd-y-deploy.md` – CI/CD y deploy (si más adelante se automatiza por Git).

---

*Documento listo para usar cuando se implemente el script de deploy con rsync.*
