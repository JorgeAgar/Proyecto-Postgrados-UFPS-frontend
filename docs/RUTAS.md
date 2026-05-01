# Rutas
> Asterisco es que no estamos seguros
- **`/*`:** Esta podría ser una homepage que redirecciona a /registro o a /aspirante/login y brindar información general(flujo de la inscripción)

- **`/registro`:** Es la el formulario donde se inscribe y crea su cuenta un aspirante. Se llega mediante un link directo de la página de la universidad

- **`/recuperar-contrasena`:** Es la página de recuperación de contraseña, todos los roles resetean su contraseña en esta página, los botones de olvidar contraseña de los login redireccionan todos acá

- **`/aspirante`:**
    - `/login`: Es la página de login para logearse como aspirante, redirecciona a /aspirante/inicio
    - `/inicio`: Es la página "principal" donde el aspirante tiene un resumen del estado de su inscripción y primeros pasos
    - `/estado`: Es la página donde le muestra el estado de su inscripción con más detalle y con un progress bar
    - `/pagos`: Es la página donde se realizan y se ven los pagos de inscripción y matrícula
    - `/documentos`:Es la página donde se realiza el cargue los documentos requeridos para inscripción
    - `/entrevistas`: Es la página donde se ven las entrevistas y solicitudes de entrevistas y se aceptan o se solicita cambio en las solicitudes de entrevistas
    - `/pruebas`: Es la página donde se ven las pruebas y solicitudes de pruebas y se aceptan o se solicita cambio en las solicitudes de pruebas

- **`/secretaria`:**
    - `/login`: Es la página de login para logearse como asistente administrativo, redireciona a /secretaria/inicio
    - `/inicio`: La página (dashborad) donde se muestran informes del estado de las inscripción de los aspirantes
    - `/validacion`: La página donde le sale la lista de cohortes (la actual sale de 1ra)
    - `/validacion/[cohorte]`: La página donde le sale el listado de los aspirantes
    - `/validacion/[aspirante]`: Página donde se revisan los documentos cargados por los aspirantes
    
- **`/comite`:**
    - `/login`: Es la página de login para logearse como comité curricular, redirecciona a /comite/inicio
    - `/inicio`: La página (dashborad) donde se muestran informes de los aspirantes inscritos, admitidos y no admitidos
    - `/criterios`: página donde se lista los criterios exitentes
    - `/criterios/definir`: La página donde se definen nuevos criterios
    - `/criterios/editar`: La página donde se editan los criterios
    - `/admision`: *por hacer*
    - *Faltan*
    
- **`/programa`:**
    - `/login`: Es la página de login para logearse como director de programa, redirecciona a /programa/inicio
    - `/inicio`:
    - *Faltan*
    
- **`/facultad`:**
    - `/login`: Es la página de login para logearse como director de factultad, redirecciona a /facultad/inicio
    - `/inicio`:
    - *Faltan*
    
- **`/superadmin`:**
     - `/login`: Es la página de login para logearse como comité curricular, redirecciona a /superadmin/inicio
     - `/inicio*`:
     - *Faltan*