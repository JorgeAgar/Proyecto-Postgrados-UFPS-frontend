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
