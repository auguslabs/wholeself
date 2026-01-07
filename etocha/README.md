# ETOCHA - Easy To Change Admin Panel

**Carpeta dedicada al panel de administración "Easy to Change"**

Esta carpeta contiene toda la información y configuración del panel de administración para este proyecto. Esto facilita la migración y copia del panel a otros proyectos.

---

## 📁 Estructura

```
etocha/
├── config/
│   └── project.json          # Configuración del proyecto (fuente)
├── images/
│   └── easytochange.svg      # Logo del panel ETOCHA
├── data/
│   └── pages/                # Datos específicos del panel (si necesario)
└── README.md                 # Este archivo
```

**Notas**:
- El archivo `project.json` se copia automáticamente a `src/data/config/project.json` para que Vite pueda importarlo. El archivo en `etocha/config/` es la fuente de verdad.
- Las imágenes en `etocha/images/` deben copiarse a `public/etocha/images/` para que sean accesibles desde el navegador. El logo se referencia como `/etocha/images/easytochange.svg`.

---

## 🔄 Migración a Otros Proyectos

Para copiar el panel a otro proyecto:

1. Copiar la carpeta `etocha/` completa
2. Copiar componentes de `src/components/admin/`
3. Copiar páginas de `src/pages/admin/`
4. Ajustar `etocha/config/project.json` con la configuración del nuevo proyecto

---

**Última actualización**: 2025-01-XX
