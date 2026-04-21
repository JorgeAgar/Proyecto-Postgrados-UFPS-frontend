import { useState } from "react";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import InputField from "./InputField";
import { saveMockSession, type UserRole } from "../utils/mockAuth";

type FieldErrors = {
  userRole?: string;
  email?: string;
  cedula?: string;
  password?: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  funcionario: "Funcionario",
  aspirante: "Aspirante",
};

const DEMO_CREDENTIALS = {
  funcionario: {
    email: "funcionario@ufps.edu.co",
    password: "UFPSdemo123",
  },
  aspirante: {
    cedula: "1098765432",
    password: "UFPSdemo123",
  },
};

const MOCK_LOGIN_ENABLED = true;

const LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_URL || "/api/login";

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
 */
export default function LoginForm() {
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"aspirante" | "funcionario">("aspirante");

  const handleCedulaChange = (value: string) => {
    setCedula(value.replace(/\D/g, ""));
    setFieldErrors((prev) => ({ ...prev, cedula: undefined }));
    setError(null);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const correoValido = correoRegex.test(correo.trim());
  const mostrarErrorCorreo = tipoUsuario === "funcionario" && correo.length > 0 && !correoValido;
  const passwordValida = password.length >= 8;
  const mostrarErrorPassword = password.length > 0 && !passwordValida;

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setFieldErrors({});
    setError(null);
    setSuccessMessage(null);
  };

    // Validación básica
    if (tipoUsuario === "aspirante") {
      if (!cedula.trim()) {
        setError("Por favor ingresa tu documento de identificación.");
        return;
      }
    } else {
      if (!correo.trim()) {
        setError("Por favor ingresa tu correo electrónico.");
        return;
      }
      if (!correoValido) {
        setError("Ingresa un correo electrónico válido.");
        return;
      }
    }

    setCedula(DEMO_CREDENTIALS.aspirante.cedula);
    setPassword(DEMO_CREDENTIALS.aspirante.password);
    setFieldErrors((prev) => ({ ...prev, cedula: undefined, password: undefined }));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userRole) {
      nextErrors.userRole = "Selecciona un tipo de acceso.";
    }

    if (userRole === "funcionario") {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        nextErrors.email = "El correo es obligatorio para funcionarios.";
      } else if (!emailRegex.test(normalizedEmail)) {
        nextErrors.email = "Ingresa un correo valido.";
      }
    }

    if (userRole === "aspirante") {
      const normalizedCedula = cedula.trim();

      if (!normalizedCedula) {
        nextErrors.cedula = "La cedula es obligatoria para aspirantes.";
      } else if (!/^\d{6,12}$/.test(normalizedCedula)) {
        nextErrors.cedula = "La cedula debe tener entre 6 y 12 digitos.";
      }
    }

    const normalizedPassword = password.trim();
    if (!normalizedPassword) {
      nextErrors.password = "La contrasena es obligatoria.";
    } else if (normalizedPassword.length < 8) {
      nextErrors.password = "La contrasena debe tener minimo 8 caracteres.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSuccessMessage(null);
      setError("Revisa los campos marcados para continuar.");
      return;
    }
    if (!passwordValida) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setOkMessage(null);

    try {
      const credentials =
        tipoUsuario === "aspirante"
          ? { cedula: cedula.trim(), password, tipoUsuario }
          : { correo: correo.trim(), password, tipoUsuario };

      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const responseBody = isJson ? await response.json() : null;

      if (!response.ok) {
        const serverMessage = responseBody?.message || responseBody?.error;
        setError(serverMessage || "Credenciales inválidas. Por favor intenta de nuevo.");
        return;
      }

      const token = responseBody?.token || responseBody?.accessToken || responseBody?.jwt;
      if (token) {
        localStorage.setItem("auth_token", token);
      }

      setOkMessage("Inicio de sesión exitoso. Validando acceso...");
      console.log("Login exitoso", responseBody);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
      {/* Selector de rol */}
      <div className="grid grid-cols-2 gap-2 animate-fade-in-up">
        <button
          type="button"
          onClick={() => {
            setTipoUsuario("aspirante");
            setCorreo("");
          }}
          aria-pressed={tipoUsuario === "aspirante"}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition shadow-sm ${
            tipoUsuario === "aspirante"
              ? "border-red-700 bg-red-700 text-white ring-2 ring-red-200"
              : "border-red-200 bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <UserIcon className="h-5 w-5" />
          Aspirante
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoUsuario("funcionario");
            setCedula("");
          }}
          aria-pressed={tipoUsuario === "funcionario"}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition shadow-sm ${
            tipoUsuario === "funcionario"
              ? "border-red-700 bg-red-700 text-white ring-2 ring-red-200"
              : "border-red-200 bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <BriefcaseIcon className="h-5 w-5" />
          Funcionario
        </button>
      </div>

      {/* Título */}
      <div className="text-center animate-fade-in-up delay-100 bg-red-700 text-white rounded-md p-4">
        <h1 className="text-2xl font-bold tracking-wide">
          ¡Bienvenido!
        </h1>
        <p className="mt-1 text-sm text-red-100">
          Acceso para {tipoUsuario === "aspirante" ? "Aspirante" : "Funcionario"}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-md text-sm border animate-fade-in bg-red-50 border-red-200 text-red-900">
          {error}
        </div>
      )}

      {okMessage && (
        <div className="px-4 py-3 rounded-md text-sm border animate-fade-in bg-emerald-50 border-emerald-200 text-emerald-700">
          {okMessage}
        </div>
      )}

      {tipoUsuario === "aspirante" ? (
        <div className="animate-fade-in-up">
          <label htmlFor="cedula" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <IdentificationIcon className="h-4 w-4 text-red-700" />
            Documento de identificación
          </label>
          <div className="bg-gray-50 rounded-md border border-gray-200 focus-within:ring-2 focus-within:ring-red-200">
            <InputField 
              id="cedula"
              type="cedula"
              placeholder="1098765432"
              value={cedula}
              onChange={handleCedulaChange}
              autoComplete="off"
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <label htmlFor="correo" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <EnvelopeIcon className="h-4 w-4 text-red-700" />
            Correo institucional
          </label>
          <div className="bg-gray-50 rounded-md border border-gray-200 focus-within:ring-2 focus-within:ring-red-200">
            <InputField
              id="correo"
              type="email"
              placeholder="nombre.apellido@ufps.edu.co"
              value={correo}
              onChange={setCorreo}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          {correo.length > 0 && (
            <p className={`mt-1 inline-flex items-center gap-1 text-xs ${mostrarErrorCorreo ? "text-red-600" : "text-emerald-700"}`}>
              {mostrarErrorCorreo ? (
                <ExclamationCircleIcon className="h-4 w-4" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              {mostrarErrorCorreo
                ? "Formato inválido. Ejemplo: nombre.apellido@ufps.edu.co"
                : "Correo válido"}
            </p>
          )}
        </div>
      )}

      {/* Campo contraseña */}
      <div className="animate-fade-in-up">
        <label htmlFor="password" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <LockClosedIcon className="h-4 w-4 text-red-700" />
          Contraseña
        </label>
        <div className="bg-gray-50 rounded-md border border-gray-200 focus-within:ring-2 focus-within:ring-red-200">
          <InputField
            id="password"
            type="password"
            placeholder="MiClaveSegura2026*"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        {password.length > 0 && (
          <p className={`mt-1 inline-flex items-center gap-1 text-xs ${mostrarErrorPassword ? "text-red-600" : "text-emerald-700"}`}>
            {mostrarErrorPassword ? (
              <ExclamationCircleIcon className="h-4 w-4" />
            ) : (
              <CheckCircleIcon className="h-4 w-4" />
            )}
            {mostrarErrorPassword
              ? "Debe tener al menos 8 caracteres"
              : "Contraseña válida"}
          </p>
        )}
      </div>

      <div className="mt-1 animate-fade-in-up flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 text-white font-bold bg-red-700 rounded-md p-3 hover:bg-red-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-400"
        >
          {loading && <Spinner />}
          {tipoUsuario === "aspirante"
            ? "Iniciar sesión Aspirante"
            : "Iniciar sesión Funcionario"}
        </button>
      </div>
    </form>
  );
}