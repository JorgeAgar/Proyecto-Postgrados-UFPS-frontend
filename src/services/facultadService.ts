/**
 * Manda datos al backend y guarda la vaina esa que devuelve el backend en una cookie
 * @param username el username para logearse
 * @param password la contraseña para logearse
 * @returns si se logeo correctamente o no
 */
export const logearFacultad = async (username: string, password: string) => {
  await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((response) => response.json(), (error) => {
      console.error("Error en la solicitud de login:", error);
      throw error;
    })
    .then((data) => {
      const loginResponse = data;
      console.log(loginResponse);
      try {
        const cookieValue = encodeURIComponent(JSON.stringify(loginResponse));
        // Guarda cookie de sesión para la autenticación
        document.cookie = `auth=${cookieValue}; path=/`;
      } catch (err) {
        console.error("Error guardando la cookie de auth:", err);
        throw err;
      }
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      throw error;
    });
};
