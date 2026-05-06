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

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData?.message || "Error desconocido al iniciar sesión.";
    console.error("Error en la respuesta del login:", errorMessage);
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

function getAccessToken() {
  const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
  const authData = JSON.parse(cookies["auth"]);
  return authData?.access_token;
}

export const listarProgramas = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/endpoint/programa/listbyfacultad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      facultadId: 1, // Reemplazar con el ID real de la facultad
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
