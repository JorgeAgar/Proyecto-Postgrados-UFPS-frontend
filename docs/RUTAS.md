# Rutas

Este documento describe todas las rutas activas de la aplicación. Está basado directamente en `src/main.tsx`.

> Los parámetros usan la sintaxis `:paramName` (ej. `/programa/validacion/cohortes/:cohorteId`).

## Resumen rápido

| Ruta | Rol | Auth | Componente |
|---|---|:---:|---|
| `/` | — | No | Redirige a `/programa/login` |
| `/registro` | Público | No | `FormInscripcion` |
| `/recuperar-password` | Todos los roles | No | `RecuperarPassword` |
| `/aspirante/login` | Aspirante | No | `AspiranteLogin` |
| `/aspirante/inicio` | Aspirante | Sí | `AspiranteInicio` |
| `/aspirante/estado` | Aspirante | Sí | `AspiranteEstado` |
| `/aspirante/documentos` | Aspirante | Sí | `AspiranteDocumentos` |
| `/aspirante/entrevista` | Aspirante | Sí | `AspiranteEntrevista` |
| `/aspirante/prueba` | Aspirante | Sí | `AspirantePrueba` |
| `/aspirante/pagos` | Aspirante | Sí | *(próximamente)* |
| `/superadmin/login` | Superadmin | No | `SuperadminLogin` |
| `/superadmin/inicio` | Superadmin | Sí | `SuperadminInicio` |
| `/superadmin/usuarios` | Superadmin | Sí | `SuperadminUsuarios` |
| `/superadmin/cohortes` | Superadmin | Sí | `SuperadminCohortes` |
| `/programa/login` | Director de programa | No | `ProgramaLogin` |
| `/programa/inicio` | Director de programa | Sí | `ProgramaInicio` |
| `/programa/cohortes` | Director de programa | Sí | `Cohortes` |
| `/programa/crear-cohorte` | Director de programa | Sí | `CrearCohorte` |
| `/programa/editar-cohorte/:id` | Director de programa | Sí | `EditarCohorte` |
| `/programa/criterios` | Director de programa | Sí | `Criterios` |
| `/programa/admision/calificacion` | Director de programa | Sí | `Calificacion` |
| `/programa/admision/calificacion/:id` | Director de programa | Sí | `CalificacionAspirante` |
| `/programa/admision/admitidos` | Director de programa | Sí | *(próximamente)* |
| `/programa/validacion` | Director de programa | Sí | `ValidacionDocumentos` |
| `/programa/validacion/cohortes/:cohorteId` | Director de programa | Sí | `ValidacionCohorteDetalle` |
| `/programa/validacion/aspirantes/:aspiranteId` | Director de programa | Sí | `ValidacionAspiranteDetalle` |
| `/facultad/login` | Director de facultad | No | `FacultadLogin` |
| `/facultad/inicio` | Director de facultad | Sí | *(próximamente)* |
| `/facultad/programas` | Director de facultad | Sí | `FacultadProgramas` |
| `/facultad/programa/:programa` | Director de facultad | Sí | `FacultadProgramaDetalle` |
| `/facultad/crear-programa` | Director de facultad | Sí | `FacultadCrearPrograma` |

---

## Rutas por rol

### Público

- **`/`**
    - Redirige automáticamente a `/programa/login`.

- **`/registro`**
    - Formulario de inscripción para nuevos aspirantes.
    - Componente: [src/vistas/FormInscripcion.tsx](src/vistas/FormInscripcion.tsx)

- **`/recuperar-password`**
    - Página de recuperación de contraseña compartida por todos los roles.
    - Recibe query params: `?loginRuta=/ruta-del-login&rol=NombreRol`
    - Componente: [src/vistas/RecuperarPassword.tsx](src/vistas/RecuperarPassword.tsx)

---

### Aspirante

Rutas anidadas bajo `AspiranteLayout` (con sidebar). Redirige a `/aspirante/inicio` si entra a `/aspirante`.

- **`/aspirante/login`**
    - Componente: [src/vistas/aspirante/AspiranteLogin.tsx](src/vistas/aspirante/AspiranteLogin.tsx)

- **`/aspirante/inicio`**
    - Panel principal del aspirante.
    - Componente: [src/vistas/aspirante/AspiranteInicio.tsx](src/vistas/aspirante/AspiranteInicio.tsx)

- **`/aspirante/estado`**
    - Estado detallado de la inscripción.
    - Componente: [src/vistas/aspirante/AspiranteEstado.tsx](src/vistas/aspirante/AspiranteEstado.tsx)

- **`/aspirante/documentos`**
    - Carga y listado de documentos requeridos.
    - Componente: [src/vistas/aspirante/AspiranteDocumentos.tsx](src/vistas/aspirante/AspiranteDocumentos.tsx)

- **`/aspirante/entrevista`**
    - Información y gestión de entrevistas.
    - Componente: [src/vistas/aspirante/AspiranteEntrevista.tsx](src/vistas/aspirante/AspiranteEntrevista.tsx)

- **`/aspirante/prueba`**
    - Información y gestión de pruebas.
    - Componente: [src/vistas/aspirante/AspirantePrueba.tsx](src/vistas/aspirante/AspirantePrueba.tsx)

- **`/aspirante/pagos`**
    - *(Próximamente)*

---

### Superadmin

Rutas anidadas bajo `SuperadminLayout`. Redirige a `/superadmin/inicio` si entra a `/superadmin`.

- **`/superadmin/login`**
    - Componente: [src/vistas/superadmin/SuperadminLogin.tsx](src/vistas/superadmin/SuperadminLogin.tsx)

- **`/superadmin/inicio`**
    - Dashboard del superadmin.
    - Componente: [src/vistas/superadmin/SuperadminInicio.tsx](src/vistas/superadmin/SuperadminInicio.tsx)

- **`/superadmin/usuarios`**
    - Gestión de usuarios del sistema.
    - Componente: [src/vistas/superadmin/SuperadminUsuarios.tsx](src/vistas/superadmin/SuperadminUsuarios.tsx)

- **`/superadmin/cohortes`**
    - Gestión de cohortes desde el superadmin.
    - Componente: [src/vistas/superadmin/SuperadminCohortes.tsx](src/vistas/superadmin/SuperadminCohortes.tsx)

---

### Director de Programa

Rutas anidadas bajo `ProgramaLayout` (con sidebar). Redirige a `/programa/inicio` si entra a `/programa`.

- **`/programa/login`**
    - Componente: [src/vistas/programa/ProgramaLogin.tsx](src/vistas/programa/ProgramaLogin.tsx)

- **`/programa/inicio`**
    - Dashboard con resumen de cohorte activa, estado de validación y calificación.
    - Componente: [src/vistas/programa/ProgramaInicio.tsx](src/vistas/programa/ProgramaInicio.tsx)

- **`/programa/cohortes`**
    - Listado de cohortes. Desde aquí se puede seleccionar una para ver su detalle o crear una nueva (la vista maneja todo internamente con estado, sin navegar a otra ruta).
    - Componente: [src/vistas/programa/cohorte/Cohortes.tsx](src/vistas/programa/cohorte/Cohortes.tsx)

- **`/programa/crear-cohorte`**
    - Formulario para crear una nueva cohorte.
    - Componente: [src/vistas/programa/cohorte/CrearCohorte.tsx](src/vistas/programa/cohorte/CrearCohorte.tsx)

- **`/programa/editar-cohorte/:id`**
    - Formulario para editar una cohorte existente.
    - Componente: [src/vistas/programa/cohorte/EditarCohorte.tsx](src/vistas/programa/cohorte/EditarCohorte.tsx)

- **`/programa/criterios`**
    - Gestión de criterios de evaluación.
    - Componente: [src/vistas/programa/Criterios.tsx](src/vistas/programa/Criterios.tsx)

- **`/programa/admision/calificacion`**
    - Listado de aspirantes a calificar para la cohorte activa.
    - Componente: [src/vistas/programa/calificacion/Calificacion.tsx](src/vistas/programa/calificacion/Calificacion.tsx)

- **`/programa/admision/calificacion/:id`**
    - Calificación individual de un aspirante por criterio.
    - Componente: [src/vistas/programa/calificacion/CalificacionAspirante.tsx](src/vistas/programa/calificacion/CalificacionAspirante.tsx)

- **`/programa/admision/admitidos`**
    - *(Próximamente)*

- **`/programa/validacion`**
    - Listado de cohortes para revisión de documentos.
    - Componente: [src/vistas/programa/validacion/ValidacionDocumentos.tsx](src/vistas/programa/validacion/ValidacionDocumentos.tsx)

- **`/programa/validacion/cohortes/:cohorteId`**
    - Listado de aspirantes de una cohorte para validar.
    - Componente: [src/vistas/programa/validacion/ValidacionCohorteDetalle.tsx](src/vistas/programa/validacion/ValidacionCohorteDetalle.tsx)

- **`/programa/validacion/aspirantes/:aspiranteId`**
    - Revisión de documentos de un aspirante.
    - Componente: [src/vistas/programa/validacion/ValidacionAspiranteDetalle.tsx](src/vistas/programa/validacion/ValidacionAspiranteDetalle.tsx)

---

### Director de Facultad

- **`/facultad/login`**
    - Componente: [src/vistas/facultad/FacultadLogin.tsx](src/vistas/facultad/FacultadLogin.tsx)

- **`/facultad/inicio`**
    - *(Próximamente)*

- **`/facultad/programas`**
    - Listado de programas académicos.
    - Componente: [src/vistas/facultad/FacultadProgramas.tsx](src/vistas/facultad/FacultadProgramas.tsx)

- **`/facultad/programa/:programa`**
    - Detalle de un programa: información, edición y eliminación.
    - Componente: [src/vistas/facultad/FacultadProgramaDetalle.tsx](src/vistas/facultad/FacultadProgramaDetalle.tsx)

- **`/facultad/crear-programa`**
    - Formulario para crear un nuevo programa.
    - Componente: [src/vistas/facultad/FacultadCrearPrograma.tsx](src/vistas/facultad/FacultadCrearPrograma.tsx)

---

## Convenciones de rutas

- Parámetros: usar `:nombreParam` (ej. `/programa/validacion/cohortes/:cohorteId`).
- No usar trailing slash: `/registro`, no `/registro/`.
- Rutas públicas: accesibles sin autenticación. Rutas privadas: requieren token válido en localStorage, el layout correspondiente redirige al login si no hay sesión.
- Rutas CRUD: seguir patrón `/entidad` (listar), `/entidad/nuevo` (crear), `/entidad/:id` (ver/editar).

## Historial de cambios

- 2026-04-30 — Versión inicial.
- 2026-05-20 — Actualización completa con rutas implementadas para programa, facultad y superadmin.
