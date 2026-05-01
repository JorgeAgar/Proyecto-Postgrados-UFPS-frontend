# Flujos
## Aspirante
1. A través de la página de la ufps le da a un botón registrarse (que no sabemos donde está todavía xd) y eso lo redirecciona acá a `/registro`
2. En `/registro` llena el formulario, luego le da al botón de registrarse, eso le muestra una pantalla que le dice que revise el correo para que le va a llegar un correo de verificación de correo
3. El usuario verifica el correo (el backend lo verifica y luego de verificarlo redirecciona al login)
4. En `/aspirante/login` el usuario inicia sesión con sus credenciales y luego redirecciona a `/aspirante/inicio`
5. En `/aspirante/inicio` la tarjeta de acción requerida y la tarjeta grande del pago le van a indicar al aspirante que tiene que pagar, le da click a la tarjeta grande del pago que lo redirecciona a realizar el pago de la inscripción
6. En `/aspirante/pagos` el aspirante le da a generar recibo y luego selecciona entre pago en línea y descargar recibo:
    - **Pago en línea:** Se realiza a través de wompi
    - **Descargar recibo:** Se descarga el pdf para pago físico
7. Se verifica el pago (transparente al aspirante)
8. Se le notifica al aspirante por correo que el pago de la inscripción fue verificado
9. En `/aspirante/inicio` la tarjeta grande de pago cambia a pago confirmado y en pagos el recibo generado cambia estado a pago (pago de conjugación de ya pagado)
10. En `/aspirante/inicio` la tarjeta de acción requerida y la tarjeta grande de documentos le van a indicar al aspirante que tiene que realizar la carga de documentos
11. El aspirante le da click a la tarjeta grande de documentos o a la sección de documentos en la sidebar y ahí le redirecciona a `/aspirante/documentos`
12. En `/aspirante/documentos` le sale el listado de documentos para cargarlos, el aspirante carga los documentos y le da al botón de enviar documentos cuando los haya subido TODOS
13. En `/aspirante/documentos` el estado de todos los documentos pasa a "enviado a revisión"
14. Cuando los documentos son revisados se envía una notificación por correo al aspirante que dice que le revisaron los documentos y en la sección de documentos los documentos aprobados pasan a estado aprobado y los rechazados pasan a estado rechazado con la razón de rechazo
15. En `/aspirante/documentos` el aspirante sube los documentos corregidos y le da al botón de enviar documentos nuevamente
16. Se repite el proceso del paso 13 hasta ahorita hasta que todos sean aprobados
17. En caso de que el comité decida hacer una entrevista o prueba con el aspirante, se le notificará por correo al aspirante que tiene una solicitud de entrevista o prueba.
18. En `/aspirante/pruebas` o `/aspirante/entrevistas` dependiendo de lo que sea le sale la solicitud al aspirante, el aspirante puede aceptar la fecha y lugar o solicitar un cambio de fecha o lugar ( u hora)
19. Cuando la prueba o entrevista ya fueron aceptadas, el aspirante hace la prueba o entrevista. El aspirante no sabe cuando se la califiquen o cuanto saque, eso es como info "privada" del comité
20. Pueden haber varias pruebas o entrevistas, se repite desde el paso 17 hasta que no hayan más entrevistas ni pruebas
21. Al final del proceso de admisión, se le envía al estudiante un correo diciendo si fue admitido o rechazado.
22. Si fue rechazado no pasa nada. Si fue aprobado:
    - En `/aspirante/inicio` aparece una nueva tarjeta grande que dice que pague el pago mínimo de matrícula, la tarjeta de acción requerida dice lo mismo
    - En `/aspirante/pagos` se le activa la opción de pago mínimo de matrícula y se realiza el mismo proceso que el pago de inscripción, excepto que se le muestra claramente que es x porcentaje del valor de la matrícula y que esta realizando el pago MÍNIMO (el resto del pago se realiza cuando ya es estudiante)
23. Se valida el pago
24. Se le envía el correo de bienvenida y se le habilitan los sistemas institucionales
### Notas flujo aspirante
- Si el aspirante ya está registrado (ej: entra un día para ver el estado de su matrícula o así, se logea en `/aspirante/login` y se le redirecciona a `/aspirante/inicio` normal)
- Se realizan 2 pagos: el pago de inscripción y el pago de matrícula, el pago de inscripción lo realizan todos los aspirantes, el pago de matrícula sólo los admitidos

## Secretaría
1. En `/secretaria/login` el usuario inicia sesión con sus credenciales y luego redirecciona a `/secretaria/inicio`
2. Entra a `/secretaria/validacion` y selecciona la cohorte (la actual sale de primera)
3. En `/secretaria/validacion/[id-cohorte]` le sale un listado de los aspirantes por estado
4. Selecciona el aspirante al que le va a verificar los documentos y redirige a `/secretaria/validacion/[id-aspirante]`
5. En `/secretaria/validacion/[id-aspirante]` selecciona el documento y lo aprueba o rechaza (si rechaza debe poner la razón)
### Notas flujo secretaría
- En inicio sale el progreso y lo que falta por verificar de la cohorte (dashboard)

## Comité
### Flujo común
1. En `/comite/login` se logean y son redireccionados a `/comite/inicio`
### Flujo de crear criterios
1. Le da click a Criterios de evaluación/Ver criterios en la sidebar, eso lo redirecciona a `/comite/criterios`
2. En `/comite/criterios` le da click al botón de nuevo criterio o en la sidebar en Criterios de evaluación/Definir criterio, eso lo redirecciona a `/comite/criterios/definir`
3. En `/comite/criterios/definir` Ingresa los datos del criterio y le da a guardar criterio, luego le sale un mensaje de que el criterio se añadió, pero no redirecciona (porque es mejor para la UX)

### Flujo de editar criterios
1. Le da click a Criterios de evaluación/Ver criterios en la sidebar, eso lo redirecciona a `/comite/criterios`
2. Le da click en el botón de editar (lápiz) del criterio a editar, eso lo redirecciona a `/comite/criterios/editar`
3. En `/comite/criterios/editar` ajusta los datos que quiera ajustar y le da a guardar cambios, luego le sale un mensaje de que fue editado exitosamente, pero no redirecciona* (por UX pero no estamos seguros xd)

### Flujo de eliminar criterios
1. Le da click a Criterios de evaluación/Ver criterios en la sidebar, eso lo redirecciona a `/comite/criterios`
2. Le da click al botón de eliminar del criterio a eliminar(caneca de basura)
3. Le da a eliminar (confirmar acción)

### Flujo de calificar aspirante
1. Le da a Admisión/Aspirantes en la sidebar, eso lo redirecciona a `/comite/admision`
2. *Selecciona el aspirante a calificar*
3. *Revisa los documentos y le da una calificación por cada criterio*
> No se ha hecho y toca que confirmar lo de las entrevistas (lo de que el comité decide a cuales aspirantes hacerles entrevista o prueba)

## Director de Programa
### Flujo común
1. En `/programa/login` se logea y lo redirecciona a `/programa/inicio`

### Flujo de crear oferta académica (cohorte)
1. *En `[por definir xd]` le da a abrir cohorte*
2. *Llena los datos y le da a abrir cohorte, y lo redirecciona a `[por definir]`*

### Flujo de editar oferta académica (cohorte)
1. *En `[por definir]` le da al botón de editar cohorte, eso lo redirecciona a `[por definir]`*
2. *Llenar los datos necesarios (normalmente fechas) y darle a guardar, eso lo redirecciona a `[por definir]`*

### Flujo de eliminar oferta académica (cohorte)
1. *En `[por definir]` le da al botón de eliminar cohorte*
2. *Le da a confirmar*

> No se ha hecho
## Director de Facultad
### Flujo común
1. En `/facultad/login` se logea y lo redirecciona a `/facultad/inicio`

### Flujo de crear programa
1. *En `[por definir xd]` le da a crear programa*
2. *Llena los datos y le da a crear programa, y lo redirecciona a `[por definir]`*

### Flujo de editar programa
1. *En `[por definir]` le da al botón de editar programa, eso lo redirecciona a `[por definir]`*
2. *Llenar los datos necesarios (normalmente personal) y darle a guardar, eso lo redirecciona a `[por definir]`*

### Flujo de eliminar programa
1. *En `[por definir]` le da al botón de eliminar programa*
2. *Le da a confirmar*