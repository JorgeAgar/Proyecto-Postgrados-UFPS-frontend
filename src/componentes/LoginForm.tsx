import { useState } from "react";
import { Link } from "react-router";
import InputField from "./InputField";

// Button inline
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/**
 * LoginForm
 *
 * Formulario de autenticación con inputs controlados.
 * Envía las credenciales vía POST a /api/login.
 *
 * Cuando el backend esté listo, reemplazar la URL del fetch
 * y manejar la respuesta (token, redirección, etc.) según lo acordado.
 *
 * La ruta "/registro" debe apuntar al componente de registro
 * que desarrollará el otro compañero. Actualmente redirige a esa ruta
 * pero muestra un placeholder hasta que esté implementado.
 */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!password) {
      setError("Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Petición POST al backend
      // Reemplazar "/api/login" con la URL real cuando el backend esté listo
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // El backend respondió con error (401, 403, etc.)
        setError("Credenciales inválidas. Por favor intenta de nuevo.");
        return;
      }

      // Manejar respuesta exitosa (guardar token, redirigir, etc.)
      // const data = await response.json();
      // navigate("/dashboard") o actualizar contexto global de autenticación
      console.log("Login exitoso");
    } catch {
      // Error de red o el backend no está disponible
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
      {/* Título */}
      <div className="text-center animate-fade-in-up delay-100 bg-red-700 text-white rounded-md p-4">
        <h1 className="text-2xl font-bold tracking-wide">
          ¡Bienvenido!
        </h1>
      </div>

      {/* Mensaje de error global */}
      {error && (
        <div
          className="px-4 py-3 rounded-md text-sm  border animate-fade-in"
          style={{
            backgroundColor: "rgba(200,16,46,0.07)",
            borderColor: "rgba(200,16,46,0.3)",
            color: "var(--ufps-red-dark)",
          }}
        >
          {error}
        </div>
      )}

      {/* Campo correo */}
      <div className="animate-fade-in-up bg-gray-50 rounded-md border border-gray-200">
        <InputField
          id="email"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      {/* Campo contraseña */}
      <div className="animate-fade-in-up bg-gray-50 rounded-md border border-gray-200">
        <InputField
          id="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      {/* Links auxiliares */}
      <div className="flex justify-center items-center animate-fade-in-up text-red-700">
        {/*
          "/registro" debe coincidir con la ruta que registre
          el compañero que desarrolla la vista de registro.
        */}
        <Link to="/registro" className="ufps-link  hover:text-red-800 hover:underline">
          ¿No tienes cuenta?
        </Link>
        {/*
          TODO: "/recuperar-clave" debe coincidir con la vista
          de recuperación de contraseña cuando esté implementada.
        */}
        {/* <Link to="/recuperar-clave" className="ufps-link  hover:text-red-800 hover:underline">
          ¿Olvidaste tu clave?
        </Link> */}
      </div>

      {/* Botón submit */}
      <div className="mt-1 animate-fade-in-up flex justify-center bg-red-700 rounded-md p-3 hover:bg-red-800 cursor-pointer">
        <button
          type="submit"
          disabled={loading}
          className="ufps-btn-primary flex items-center justify-center gap-2 text-white font-bold"
        >
          {loading && <Spinner />}
          Iniciar sesión
        </button>
      </div>
    </form>
  );
}
