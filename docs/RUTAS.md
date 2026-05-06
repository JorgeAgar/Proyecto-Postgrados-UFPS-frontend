# Rutas

Este documento describe las rutas principales de la aplicación web: convenciones, rutas públicas y privadas, y la correspondencia con los componentes de la interfaz. Está dirigido a desarrolladores y a la persona responsable de arquitectura front-end.

> Nota: los parámetros en rutas documentadas usan la sintaxis `:paramName` (p. ej. `/secretaria/validacion/:cohorteId`). Las entradas marcadas como "Pendiente" requieren confirmación.

## Resumen rápido

| Ruta | Rol | Auth | Componente (sugerido) | Notas |
|---|---:|:---:|---|---|
| `/` | Público | N/A | Pendiente | Página raíz — comportamiento por confirmar (landing o redirección a `/registro`) |
| `/registro` | Público | No | [src/vistas/FormInscripcion.tsx](src/vistas/FormInscripcion.tsx) | Formulario de inscripción de aspirantes |
| `/recuperar-contrasena` | Público | No | Pendiente | Página de recuperación de contraseña para todos los roles |
| `/aspirante/*` | Aspirante | Sí | [src/vistas/aspirante](src/vistas/aspirante) | Rutas internas para flujo de aspirante |
| `/secretaria/*` | Secretaria/Asistente | Sí | Pendiente | Gestión de validación y cohortes |
| `/comite/*` | Comité curricular | Sí | Pendiente | Gestión de criterios y admisión |
| `/programa/*` | Director de programa | Sí | Pendiente | Funcionalidades del programa |
| `/facultad/*` | Director de facultad | Sí | Pendiente | Funcionalidades de facultad |
| `/superadmin/*` | Superadmin | Sí | Pendiente | Panel administrativo global |

## Convenciones de rutas

- Parámetros: usar `:nombreParam` (ej. `/secretaria/validacion/:cohorteId`).
- No documentamos rutas con trailing slash; ej. usar `/registro`, no `/registro/`.
- Rutas públicas: accesibles sin autenticación. Rutas privadas: requieren token y autorización por rol.
- Nombres de rutas CRUD: seguir patrón REST/SPA: listar `/entidad`, crear `/entidad/nuevo`, ver `/entidad/:id`, editar `/entidad/:id/editar`.

## Rutas por rol

### Aspirante

- `/aspirante/login`
    - Descripción: Página de autenticación para aspirantes. Tras login exitoso redirige a `/aspirante/inicio`.
    - Auth: pública (redirecta si ya autenticado)
    - Componente: [src/vistas/Login.tsx](src/vistas/Login.tsx)

- `/aspirante/inicio`
    - Descripción: Panel principal del aspirante con resumen del estado de inscripción.
    - Auth: `aspirante`
    - Componente: [src/vistas/aspirante/AspiranteInicio.tsx](src/vistas/aspirante/AspiranteInicio.tsx) (si existe)

- `/aspirante/estado`
    - Descripción: Estado detallado de la inscripción (progress bar, pasos pendientes).
    - Auth: `aspirante`
    - Componente: [src/vistas/Status.tsx](src/vistas/Status.tsx)

- `/aspirante/pagos`
    - Descripción: Visualización y gestión de pagos de inscripción y matrícula.
    - Auth: `aspirante`
    - Componente: [src/vistas/pago-inscripcion/pages/PagoInscripcionPage.jsx](src/vistas/pago-inscripcion/pages/PagoInscripcionPage.jsx)
    - Nota: definir si se separan flujos de inscripción y matrícula o se diferencian por estado/consulta.

- `/aspirante/documentos`
    - Descripción: Carga y listado de documentos requeridos.
    - Auth: `aspirante`
    - Componente: [src/vistas/aspirante/AspiranteDocumentos.tsx](src/vistas/aspirante/AspiranteDocumentos.tsx)

- `/aspirante/entrevistas`
    - Descripción: Solicitudes y agenda de entrevistas.
    - Auth: `aspirante`
    - Componente: [src/vistas/aspirante/AspiranteEntrevista.tsx](src/vistas/aspirante/AspiranteEntrevista.tsx)

- `/aspirante/pruebas`
    - Descripción: Solicitudes y resultados de pruebas.
    - Auth: `aspirante`
    - Componente: [src/vistas/aspirante/AspirantePrueba.tsx](src/vistas/aspirante/AspirantePrueba.tsx)

### Secretaria

- `/secretaria/login`
    - Descripción: Login para asistentes administrativos.
    - Auth: pública
    - Componente: Pendiente

- `/secretaria/inicio`
    - Descripción: Dashboard con informes de inscripciones.
    - Auth: `secretaria`
    - Componente: Pendiente

- `/secretaria/validacion`
    - Descripción: Lista de cohortes para validación.
    - Auth: `secretaria`
    - Componente: Pendiente

- `/secretaria/validacion/:cohorteId`
    - Descripción: Listado de aspirantes para la cohorte seleccionada.
    - Auth: `secretaria`
    - Componente: Pendiente

- `/secretaria/validacion/:cohorteId/:aspiranteId`
    - Descripción: Revisión de documentos por aspirante.
    - Auth: `secretaria`
    - Componente: Pendiente

### Comité curricular

- `/comite/login`
    - Descripción: Login para miembros del comité curricular.
    - Auth: pública
    - Componente: Pendiente

- `/comite/inicio`
    - Descripción: Dashboard con métricas de admisión.
    - Auth: `comite`
    - Componente: Pendiente

- `/comite/criterios`
    - Descripción: Listado y gestión de criterios de admisión.
    - Subrutas: `/comite/criterios/definir`, `/comite/criterios/:criterioId/editar`.
    - Componente: Pendiente

- `/comite/admision`
    - Descripción: (Pendiente) Flujo de admisión y decisiones.
    - Auth: `comite`
    - Componente: Pendiente

### Programa / Facultad / Superadmin

- Las rutas principales para `/programa`, `/facultad` y `/superadmin` se describirán cuando se definan las funcionalidades concretas. Mantener patrón: `/rol/login`, `/rol/inicio`, `/rol/entidad/...`.

## Redirects y fallback

- Comportamiento de `/` (raíz): decidir entre servir una landing pública o redirigir a `/registro` o `/aspirante/login` según el caso.
- Página 404: implementar ruta de fallback en el router de la app.
- Manejo de permisos: para rutas privadas devolver 401 (no autenticado) o 403 (sin permisos) según corresponda.

## Preguntas pendientes / Acciones requeridas

1. Confirmar comportamiento de la raíz `/` (landing vs redirección automática).
2. Acordar sintaxis final de parámetros (propongo `:paramName`, ya aplicado aquí).
3. Determinar política para pagos: ¿unificar `/aspirante/pagos` para todos los tipos o separar inscripción/matrícula?
4. Revisar y añadir los componentes faltantes para `/secretaria`, `/comite`, `/programa`, `/facultad`, `/superadmin`.
5. Corregir la descripción de `superadmin/login` si hubo copy-paste.

## Historial de cambios

- 2026-04-30 — Reescritura inicial con estructura técnica (autor: equipo front-end).
