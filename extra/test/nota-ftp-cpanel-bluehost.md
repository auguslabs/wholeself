# Crear cuenta FTP en cPanel (Bluehost)

Nota rápida sobre los campos al crear una cuenta FTP en cPanel y qué poner en **Directorio**.

---

## Campos del formulario "Add FTP Account"

| Campo | Qué poner |
|-------|-----------|
| **Log In** | Solo el nombre de usuario (sin `@` ni dominio). Ejemplo: `redesigned` o `deploy`. El usuario completo será **`[esto]@wholeselfnm.com`** (ej. `redesigned@wholeselfnm.com`). |
| **Domain** | Suele venir ya elegido (ej. `wholeselfnm.com`). |
| **Password** | Contraseña segura para el FTP. |
| **Password (Again)** | La misma contraseña. |
| **Directory** | **Ruta del servidor** donde podrá trabajar este usuario (ver abajo). |
| **Quota** | "Unlimited" o el límite en MB que quieras. |

---

## Directorio (Directory) — importante

**No** se pone una URL como `wholeselfnm.com/redesigned`.  
El campo **Directory** espera la **ruta de carpetas en el servidor**, no el dominio.

- **Si quieres que el usuario solo vea y suba archivos a la carpeta del rediseño** (recomendado), usa la ruta **completa** hasta esa carpeta:
  - Formato típico: **`/home[código]/[usuario_cpanel]/public_html/redesigned`**
  - Ejemplo: **`/home4/omvbnmmy/public_html/redesigned`**  
  (sustituye `omvbnmmy` por el usuario de cPanel que te asigne Bluehost si es distinto).

- Así, al conectar por FTP con esa cuenta, entrarás **directamente** en `public_html/redesigned` y no verás el resto de `public_html` (WordPress, etc.). Todo lo que subas quedará en esa carpeta.

**Cómo saber la ruta exacta:** En cPanel → File Manager, entra en `public_html` → `redesigned`. Arriba suele aparecer la ruta completa (ej. `/home4/omvbnmmy/public_html/redesigned`). Esa es la que debes pegar en **Directory**.

---

## Si ya creaste la cuenta con "Directory" mal

Si pusiste algo como `wholeselfnm.com/redesigned`, cPanel puede haber creado o asociado otra ruta (ej. `/home4/.../redesigned` sin `public_html`), por eso en FileZilla no ves los archivos que sí ves en File Manager (donde estás en `public_html/redesigned`).

**Solución:** Editar la cuenta FTP en cPanel (FTP Accounts → junto al usuario, "Manage" o el lápiz) y cambiar **Directory** a la ruta correcta: **`/home4/omvbnmmy/public_html/redesigned`** (con tu usuario real). Guardar y volver a conectar con FileZilla; deberías ver los mismos archivos que en File Manager.
