# Estructura de archivos
> - Las carpetas usan kebab-case
> - Los archivos de componentes usan PascalCase
> - Los archivos TS puros (servicios, etc.) usan camelCase

`docs/` — Documentación en markdown del proyecto
- `ESTRUCTURA_ARCHIVOS.md`
- `RUTAS.md`
- `FLUJOS.md`
- `REGLAS.md`

`src/`
- `components/` — Componentes reutilizables globales
    - `AppSidebar.tsx` — Sidebar genérica base usada por todos los layouts con sus nav items
    - `InputField.tsx` — Campo de formulario reutilizable (usado en todos los logins)

- `layouts/` — Layouts con sidebar y protección de sesión por rol
    - `AspiranteLayout.tsx`
    - `FacultadLayout.tsx`
    - `ProgramaLayout.tsx`
    - `SuperadminLayout.tsx`

- `services/` — Servicios de conexión con el backend, agrupados por rol
    - `aspirante/`
        - `aspiranteDocumentosService.ts`
        - `aspirantePagosService.ts`
    - `programa/`
        - `programaService.ts` — Auth del director de programa: login, logout, refreshSession, y `programaApiFetch` (fetch autenticado con retry)
        - `programaInicioService.ts`
        - `programaChortesService.ts`
        - `programaCriteriosService.ts`
        - `programaAdmitidosService.ts`
        - `programaCalificacionService.ts`
        - `programaCalificacionAspiranteServise.ts`
        - `validacionService.ts`
    - `superadmin/`
        - `superadminService.ts` — Auth del superadmin
        - `superadminUsuariosService.ts`
        - `superadminCohortesService.ts`
    - `facultadService.ts`
    - `usuariosService.ts`

- `vistas/` — Vistas agrupadas por rol
    - `aspirante/`
        - `AspiranteLogin.tsx`
        - `AspiranteInicio.tsx`
        - `AspiranteEstado.tsx`
        - `AspiranteDocumentos.tsx`
        - `AspiranteEntrevista.tsx`
        - `AspirantePrueba.tsx`
        - `AspirantePagos.tsx`
        - `components/`
            - `Sidebar.tsx`
    - `facultad/`
        - `FacultadLogin.tsx`
        - `FacultadProgramas.tsx` — Listado de programas
        - `FacultadProgramaDetalle.tsx` — Detalle, edición y eliminación de un programa
        - `FacultadCrearPrograma.tsx`
        - `components/`
            - `Sidebar.tsx`
            - `InfoProgramaDetalle.tsx`
            - `DescripcionProgramaDetalle.tsx`
            - `ModalEliminar.tsx` — Modal de confirmación de eliminación reutilizable
    - `programa/`
        - `ProgramaLogin.tsx`
        - `ProgramaInicio.tsx` — Dashboard con resumen de cohorte activa, validación y calificación
        - `calificacion/`
            - `Calificacion.tsx` — Listado de aspirantes a calificar
            - `CalificacionAspirante.tsx` — Calificación individual por criterio
        - `cohorte/`
            - `Cohortes.tsx` — Listado, detalle, creación y edición de cohortes (todo en una sola vista con estado interno)
            - `CohorteForm.tsx` — Formulario compartido por CrearCohorte y EditarCohorte
            - `CrearCohorte.tsx`
            - `EditarCohorte.tsx`
        - `validacion/`
            - `ValidacionDocumentos.tsx` — Listado de cohortes para validar
            - `ValidacionCohorteDetalle.tsx` — Aspirantes de una cohorte
            - `ValidacionAspiranteDetalle.tsx` — Documentos de un aspirante
        - `components/`
            - `Sidebar.tsx` — Sidebar del director de programa (usa AppSidebar)
    - `superadmin/`
        - `SuperadminLogin.tsx`
        - `SuperadminInicio.tsx`
        - `SuperadminUsuarios.tsx`
        - `SuperadminCohortes.tsx`
        - `components/`
            - `Sidebar.tsx`
            - `Modal.tsx` — Modal genérico con animaciones de entrada/salida
    - `FormInscripcion.tsx` — Formulario público de inscripción de aspirantes
    - `RecuperarPassword.tsx` — Recuperación de contraseña, compartida por todos los roles (recibe `?loginRuta=` y `?rol=` por query params)
    - `Status.tsx`

- `main.tsx` — Punto de entrada: define el router con todas las rutas de la app
- `index.css` — Estilos globales (Tailwind + animaciones personalizadas)
