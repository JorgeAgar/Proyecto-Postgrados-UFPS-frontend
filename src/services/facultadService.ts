/**
 * Manda datos al backend y guarda la vaina esa que devuelve el backend en una cookie
 * @param username el username para logearse
 * @param password la contraseña para logearse
 * @returns si se logeo correctamente o no
 */
export const logearFacultad = async (username: string, password: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  console.log("Enviando solicitud de login: ", JSON.stringify({ username, password }));

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al iniciar sesión.";
      console.error("Error en la respuesta del login:", errorMessage);
      console.error(response.status, response.statusText);
    throw new Error(errorMessage);
  }

  try {
    const loginResponse = await response.json();
    // console.log(loginResponse);
    const cookieValue = encodeURIComponent(JSON.stringify(loginResponse));
    // Guarda cookie de sesión para la autenticación
    document.cookie = `auth=${cookieValue}; path=/`;
  } catch (err) {
    console.error("Error parseando la respuesta del login:", err);
    throw err;
  }
};


/**
 * Saca el token de acceso de la cookie de sesión para usarlo en las solicitudes al backend.
 * @returns el token de acceso
 */
function getAccessToken() {
  const cookies = document.cookie.split("; ").reduce((acc: Record<string, string>, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
  const authData = JSON.parse(cookies.auth);
  return authData?.accessToken;
}


/**
 * Lista los programas de la facultad del director logeado.
 * @returns un array con los programas
 */
export const listarProgramas = async () => {
  console.log("Listando programas para la facultad del director logeado.");
  console.log("Usando token de acceso:", getAccessToken());

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/endpoint/programa/listbyfacultad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      id: 1, // TODO: reemplazar con el id de la facultad del director logeado
    }),
  }).catch((err) => {
    console.error("Error en la solicitud de programas:", err);
    throw err;
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al listar programas.";
    console.error("Error en la respuesta de listar programas:", errorMessage);
    throw new Error(errorMessage);
  }
  const programas = await response.json();
  return programas;
}


/**
 * Obtiene el detalle de un programa específico por su ID.
 * @param programaId el id del programa
 * @returns el programa
 */
export const obtenerDetallePrograma = async (programaId: number) => {
  console.log("Obteniendo detalle del programa con ID:", programaId);
  console.log("Usando token de acceso:", getAccessToken());

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/endpoint/programa/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ id: programaId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al obtener el detalle del programa.";
    console.error("Error en la respuesta de obtener detalle del programa:", errorMessage);
    console.error(response.status, response.statusText);
    throw new Error(errorMessage);
  }
  const programa = await response.json();
  return programa;
}

export const obtenerPosiblesDirectores = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/endpoint/administrativo/listPosibleDirector`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al obtener posibles directores.";
    console.error("Error en la respuesta de obtener posibles directores:", errorMessage);
    console.error(response.status, response.statusText);
    throw new Error(errorMessage);
  }
  const directores = await response.json();
  return directores;
}

export const listarSedes = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/endpoint/sedes/listall`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
    },
  });
  if(!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al listar sedes.";
    console.error("Error en la respuesta de listar sedes:", errorMessage);
    console.error(response.status, response.statusText);
    throw new Error(errorMessage);
  }
  const sedes = await response.json();
  return sedes;
}