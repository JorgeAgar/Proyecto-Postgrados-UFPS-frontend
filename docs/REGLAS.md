# Reglas

## Nombres
 - Las carpetas usan kebab-case
 - Los archivos de componentes (y los componentes) usan PascalCase
 - Los archivos TS puros (API, etc) usan camelCase
 - Variables de entorno en SCREAMING_SNAKE_CASE
 - constantes, variables, funciones que no quepan aquí camelCase
 - ramas en git usan kebab-case
 - las ramas de arreglar algo empiezan con fix/[nombre]
 - las ramas normales se llaman en lo que están trabajando y tratar de ser nombres cortos
 - commits y todo eso en español

## Cosas que no se suben en los commits normalmente pero que no están en el gitignore
- main.tsx
- index.css
- archivos que no sean específicamente de lo que está trabajando en su rama (ser super específico)
- archivos de configuración de TypeScript (no se debería ni cambiar)
- eslint.config.js (no se debería ni cambiar)
- vite.config.ts (no se debería ni cambiar)

## Git
**Link GitHub:** https://github.com/JorgeAgar/Proyecto-Postgrados-UFPS-frontend
### Flujo de trabajo en git
1. Tener la dev actualizada (pull)
2. Crear una rama desde la dev sobre la que van a trabajar
3. Trabajar sobre esa rama
4. Hacer Pull Request a la dev (base: dev - compare:[rama sobre la que están trabajando])
5. Si todo está bien y eso mergear la PR y borrar la rama sobre la que se hicieron los cambios
### Reglas de git
- Las ramas son para **UNA SOLA COSA**, si van a hacer un cambio diferente hacen otra rama
- Solamente realizar cambios a lo que están haciendo en las ramas de trabajo (y en general tratar de modificar los mínimos archivos posibles en cada rama)
- Sólo le pueden hacer push a las ramas de trabajo
- No se le puede hacer push a la dev ni a la main bajo ninguna circunstancia
- La main sólo se actualiza con PRs de la dev
- Tratar de no hacer push cada vez que se hace commit, xq cada vez que se hace commit de cualquier rama se construye el proyecto para un despliegue de preview
- Si no se ha podido mergear sus cambios a la dev y van a trabajar en otra cosa sobre el trabajo de alguna otra rama ps pueden hacer su nueva rama en base a dicha rama
- Nombres de las ramas en kebab-case
- Pueden tener varias ramas de trabajo al tiempo
- Idealmente las PRs son evaluadas por otro miembro del equipo pero es entendible que por tiempo casi ninguna sea así
- No hacer `--force-push`
- No hacer `git reset` a una rama que esté en remote al menos que sea algo completamente extraordinario

## Diseño
En general modo claro con color rojo y blanco (los que están en Figma)
Guiarnos con lo que hay en este proyecto de Figma: [Link](https://www.figma.com/files/team/1545929088682205352/project/594308804?fuid=1545929086424815616)