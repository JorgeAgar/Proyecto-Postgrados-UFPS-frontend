# Estructura de archivos
> - Las carpetas usan kebab-case
> - Los archivos de componentes usan PascalCase
> - Los archivos TS puros (API, etc) usan camelCase

`docs/`: Docs en markdown generales del proyecto
    - `RUTAS.md`
    - `ESTRUCTURA_ARCHIVOS.md`
    - `FLUJOS.md`
    - `REGLAS.md`
`src/`
- `assets/`: Los png, o cualquier archivo (foto probablemente) que vayamos a usar
- `vistas/`: Son los archivos de las vistas, agrupadas por rutas de la página (seguir el ejemplo de abajo con eso se entiende xd)
    - `aspirante/`: Tiene las vistas de aspirante, cada archivo es una vista
        - `AspiranteLogin.tsx`
        - `AspiranteLayout.tsx`
        - `AspiranteInicio.tsx`
        - `AspirantePagos.tsx`
        - `AspiranteDocumentos.tsx`
        - `AspiranteEntrevistas.tsx`
        - `AspirantePruebas.tsx`
        - `componentes/`: Los componentes específicos de las vistas de aspirante
            - `layout/`: Los componentes específicos de la vista de layout
                - `ComponenteDelLayout1.tsx`
                - `ComponenteDelLayout2.tsx`
            - `inicio/`:
                - `ComponenteDelLayout1.tsx`
    - `secretaria/`: Tiene las vistas de secretaría, cada archivo es una vista
        - `SecretariaLogin.tsx`
        - `SecretariaLayout.tsx`
        - `SecretariaInicio.tsx`
        - `validacion/`: Tiene las "subvistas" de validación de secretaría
            - `SecretariaCohortes.tsx`
            - `SecretariaAspirantes.tsx`
            - `SecretariaAspirante.tsx`
    - `comite/`: Tiene las vistas de comité, cada archivo es una vista
        - `ComiteLogin.tsx`
        - `ComiteInicio.tsx`
        - `criterios/`: Tiene las "subvistas" de criterios de comité
            - `ComiteCriterios.tsx`
            - `ComiteDefinirCriterio.tsx`
            - `ComiteEditarCriterio.tsx`
        - *falta*
    - `programa/`: Tiene las vistas de director de programa, cada archivo es una vista
        - `ProgramaLogin.tsx`
        - `ProgramaInicio.tsx`
        - *falta*
    - `facultad/`: Tiene las vistas de director de facultad, cada archivo es una vista
        - `FacultadLogin.tsx`
        - `FacultadInicio.tsx`
        - *falta*
    - `superadmin/`: Tiene las vistas de superadmin, cada archivo es una vista
        - `SuperadminLogin.tsx`
        - `SuperadminInicio.tsx`
        - *falta*
- `utils/`: Son archivos ts normales que hacen cosas
    - `services/`: Son los que se conectan con el backend
        - `comiteService.ts`
        - `aspiranteService.ts`
        - `secretariaService.ts`
        - `programaService.ts`
        - `facultadService.ts`
        - `superadminService.ts`