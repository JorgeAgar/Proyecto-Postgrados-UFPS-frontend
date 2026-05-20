# Flujos

Describe los flujos de usuario por rol. Los pasos marcados con *cursiva* están pendientes de implementar en el frontend.

---

## Aspirante

1. Desde la página de la UFPS el aspirante accede al formulario de inscripción en `/registro`.
2. En `/registro` llena el formulario y le da a registrarse. El sistema le muestra un mensaje indicando que revise su correo para verificarlo.
3. El aspirante verifica el correo (el backend lo valida y redirige al login).
4. En `/aspirante/login` inicia sesión y es redirigido a `/aspirante/inicio`.
5. En `/aspirante/inicio` la tarjeta de acción requerida y la tarjeta de pago le indican que debe pagar la inscripción.
6. En `/aspirante/pagos` genera el recibo y elige entre:
    - **Pago en línea:** a través de Wompi.
    - **Descargar recibo:** descarga el PDF para pago físico.
7. El pago es verificado de forma transparente al aspirante.
8. El aspirante recibe un correo confirmando el pago de inscripción.
9. En `/aspirante/inicio` la tarjeta de pago cambia a "pago confirmado".
10. La tarjeta de acción requerida le indica que debe cargar los documentos.
11. El aspirante va a `/aspirante/documentos` (desde la tarjeta o la sidebar).
12. Carga todos los documentos y le da a "enviar documentos".
13. El estado de los documentos pasa a "enviado a revisión".
14. Al revisar los documentos, el aspirante recibe un correo. Los aprobados cambian a estado aprobado y los rechazados muestran la razón de rechazo.
15. El aspirante corrige y vuelve a subir los documentos rechazados.
16. Se repite el proceso hasta que todos los documentos estén aprobados.
17. Si el comité decide hacer entrevista o prueba, el aspirante recibe un correo con la solicitud.
18. En `/aspirante/entrevista` o `/aspirante/prueba` ve la solicitud y puede aceptar la fecha/lugar o pedir un cambio.
19. El aspirante realiza la entrevista o prueba. El resultado es privado (lo maneja el director de programa).
20. Pueden haber varias entrevistas o pruebas; se repite desde el paso 17.
21. Al final del proceso, el aspirante recibe un correo indicando si fue admitido o rechazado.
22. Si fue admitido:
    - En `/aspirante/inicio` aparece una tarjeta de pago mínimo de matrícula.
    - En `/aspirante/pagos` se activa la opción de pago mínimo de matrícula (mismo flujo que el pago de inscripción).
23. Se valida el pago de matrícula.
24. El aspirante recibe el correo de bienvenida y se le habilitan los sistemas institucionales.

### Notas
- Se realizan 2 pagos: inscripción (todos los aspirantes) y matrícula (solo los admitidos).
- Si el aspirante ya está registrado, entra a `/aspirante/login` y es redirigido a `/aspirante/inicio` directamente.

---

## Director de Programa

### Flujo común
1. En `/programa/login` inicia sesión y es redirigido a `/programa/inicio`.
2. En `/programa/inicio` ve un resumen de la cohorte activa: total de inscritos, validaciones pendientes y estado de calificación.

### Flujo de gestión de cohortes
1. En la sidebar le da click a "Cohortes", eso lo lleva a `/programa/cohortes`.
2. En `/programa/cohortes` ve el listado de cohortes. Puede:
    - **Seleccionar una cohorte:** Se expande el detalle en la misma página (nombre, fechas, criterios, admitidos). Puede editar los datos y guardar.
    - **Crear nueva cohorte:** Le da al botón "Nueva cohorte", aparece un formulario en la misma página. Llena los datos y le da a "Crear cohorte".

### Flujo de calificación de aspirantes
1. En la sidebar le da click a "Admisión → Calificación", lo lleva a `/programa/admision/calificacion`.
2. En `/programa/admision/calificacion` ve el listado de aspirantes con su estado de calificación y puntaje total.
3. Le da click a un aspirante, lo lleva a `/programa/admision/calificacion/:id`.
4. En `/programa/admision/calificacion/:id` ve el perfil del aspirante, sus documentos y la tabla de criterios. Asigna un puntaje por cada criterio y guarda.

### Flujo de validación de documentos
1. En la sidebar le da click a "Validación", lo lleva a `/programa/validacion`.
2. En `/programa/validacion` ve el listado de cohortes con porcentaje de validación. Le da click a una.
3. En `/programa/validacion/cohortes/:cohorteId` ve los aspirantes de esa cohorte. Le da click a uno.
4. En `/programa/validacion/aspirantes/:aspiranteId` revisa los documentos del aspirante y los aprueba o rechaza.

### Flujo de gestión de criterios
1. En la sidebar le da click a "Criterios", lo lleva a `/programa/criterios`.
2. En `/programa/criterios` ve los criterios definidos con sus pesos, puede editarlos y guardar los cambios.

---

## Director de Facultad

### Flujo común
1. En `/facultad/login` inicia sesión y es redirigido a `/facultad/programas`.

### Flujo de gestión de programas
1. En `/facultad/programas` ve el listado de programas académicos de la facultad.
2. Le da click a un programa, lo lleva a `/facultad/programa/:programa`.
3. En `/facultad/programa/:programa` ve el detalle del programa (nombre, sede, facultad, director, etc.). Puede editar los datos o eliminar el programa (con modal de confirmación).

### Flujo de crear programa
1. En `/facultad/programas` le da al botón de crear, lo lleva a `/facultad/crear-programa`.
2. Llena el formulario y guarda.

---

## Superadmin

### Flujo común
1. En `/superadmin/login` inicia sesión y es redirigido a `/superadmin/inicio`.

### Gestión de usuarios
1. En la sidebar le da click a "Usuarios", lo lleva a `/superadmin/usuarios`.
2. Puede ver, crear, editar y eliminar usuarios del sistema.

### Gestión de cohortes
1. En la sidebar le da click a "Cohortes", lo lleva a `/superadmin/cohortes`.
2. Puede ver y gestionar las cohortes del sistema.

---

## Secretaría *(pendiente de implementar)*

1. En `/secretaria/login` inicia sesión y es redirigido a `/secretaria/inicio`.
2. Entra a `/secretaria/validacion` y selecciona la cohorte.
3. En `/secretaria/validacion/:cohorteId` ve el listado de aspirantes por estado.
4. Selecciona un aspirante y lo lleva a `/secretaria/validacion/:aspiranteId`.
5. Aprueba o rechaza cada documento (si rechaza debe poner la razón).

---

## Comité curricular *(pendiente de implementar)*

### Flujo común
1. En `/comite/login` inicia sesión y es redirigido a `/comite/inicio`.

### Flujo de criterios
1. Va a `/comite/criterios` desde la sidebar.
2. Puede crear, editar o eliminar criterios de evaluación.

### Flujo de calificación de aspirantes
1. Va a `/comite/admision` desde la sidebar.
2. Selecciona el aspirante a calificar, revisa documentos y asigna calificación por criterio.
