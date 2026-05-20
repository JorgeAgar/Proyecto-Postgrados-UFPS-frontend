# Proyecto Postgrados UFPS Frontend

Frontend web para la gestión de procesos de inscripción a programas de posgrados de la UFPS, desde la inscripción del aspirante, la validación de documentos, la calificación del aspirante, la admisión y la legalización de la matrícula. La aplicación está construida con React, TypeScript y Vite, y organiza la experiencia por roles para atender flujos de aspirante, programa, facultad y superadmin.
La aplicación comprende módulos para 4 roles: Aspirante, Director de programa, Director de facultad y Superadmin.

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Heroicons

## Requisitos

- Node.js instalado
- npm disponible en el entorno

## Instalación

```bash
npm install
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

- `npm run dev`: levanta el entorno de desarrollo con Vite.
- `npm run build`: compila TypeScript y genera la versión de producción.
- `npm run lint`: ejecuta ESLint sobre el proyecto.
- `npm run preview`: sirve localmente el build de producción.

## Estructura general

```text
src/
├─ assets/
├─ components/
├─ layouts/
├─ services/
└─ vistas/
	├─ aspirante/
	├─ comite/
	├─ facultad/
	├─ programa/
	└─ superadmin/
```

La carpeta `docs/` contiene documentación complementaria sobre estructura, flujos, reglas y rutas.

## Rutas principales

La navegación principal se define en `src/main.tsx`. Actualmente el enrutado incluye:

- `/` → redirección a `/programa/login`
- `/registro` → formulario de inscripción
- `/recuperar-password` → recuperación de contraseña
- `/aspirante/*` → flujo del aspirante
- `/programa/*` → panel del director de programa
- `/facultad/*` → panel del director de facultad
- `/superadmin/*` → panel de administración global

También existen vistas y servicios para el módulo de comité, preparados para integrarse conforme avance el enrutado y los flujos de negocio.

## Convenciones del proyecto

- Los archivos de vistas usan `PascalCase`.
- Los archivos de servicios usan `camelCase`.
- Las carpetas usan `kebab-case`.
- Las rutas de la app se agrupan por rol y se montan sobre layouts específicos.

## Documentación relacionada

- `docs/ESTRUCTURA_ARCHIVOS.md`
- `docs/FLUJOS.md`
- `docs/REGLAS.md`
- `docs/RUTAS.md`

## Estado del proyecto

El proyecto está en evolución y varias pantallas muestran estados pendientes o placeholders. La base actual ya cubre la navegación principal y la separación de responsabilidades por módulo.
