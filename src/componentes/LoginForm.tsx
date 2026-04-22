import { useState } from "react";
import { useNavigate } from "react-router";
// Íconos importados de Heroicons (https://heroicons.com/)
import {
  BriefcaseIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import InputField from "./InputField";

type FieldErrors = {
  userRole?: string;
  email?: string;
  cedula?: string;
  password?: string;
};

type UserRole = "funcionario" | "aspirante";

const ROLE_LABELS: Record<UserRole, string> = {
  funcionario: "Funcionario",
  aspirante: "Aspirante",
};



function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | "">("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCedula = cedula.trim();
  const normalizedPassword = password.trim();

  const mostrarErrorCorreo =
    userRole === "funcionario" &&
    email.length > 0 &&
    !!fieldErrors.email &&
    !correoRegex.test(normalizedEmail);

  const mostrarErrorPassword = password.length > 0 && !!fieldErrors.password && normalizedPassword.length < 8;

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setFieldErrors({});
    setError(null);
    setOkMessage(null);
  };

  const handleCedulaChange = (value: string) => {
    setCedula(value.replace(/\D/g, ""));
    setFieldErrors((prev) => ({ ...prev, cedula: undefined }));
    setError(null);
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!userRole) {
      nextErrors.userRole = "Selecciona un tipo de acceso.";
    }

    if (userRole === "funcionario") {
      if (!normalizedEmail) {
        nextErrors.email = "El correo es obligatorio para funcionarios.";
      } else if (!correoRegex.test(normalizedEmail)) {
        nextErrors.email = "Ingresa un correo válido.";
      }
    }

    if (userRole === "aspirante") {
      if (!normalizedCedula) {
        nextErrors.cedula = "La cédula es obligatoria para aspirantes.";
      } else if (!/^\d{6,12}$/.test(normalizedCedula)) {
        nextErrors.cedula = "La cédula debe tener entre 6 y 12 dígitos.";
      }
    }

    if (!normalizedPassword) {
      nextErrors.password = "La contraseña es obligatoria.";
    } else if (normalizedPassword.length < 8) {
      nextErrors.password = "La contraseña debe tener mínimo 8 caracteres.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Revisa los campos marcados para continuar.");
      setOkMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setOkMessage(null);

    try {
  
      const credentials =
        userRole === "aspirante"
          ? { numeroDocumento: normalizedCedula, contrasena: normalizedPassword }
          : { correo: normalizedEmail, password: normalizedPassword};

      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/usuarioaspirante/login`, {
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

      // Sesión temporal mientras el backend no entrega token para todos los flujos.
      localStorage.setItem(
        "session",
        JSON.stringify({
          userRole,
          loggedIn: true,
          displayName: userRole === "aspirante" ? "Aspirante" : "Funcionario",
        })
      );

      setOkMessage("Inicio de sesión exitoso. Validando acceso...");
      navigate(userRole === "aspirante" ? "/aspirante" : "/funcionario/home");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 animate-fade-in-up">
        <button
          type="button"
          onClick={() => handleRoleChange("aspirante")}
          aria-pressed={userRole === "aspirante"}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition shadow-sm ${
            userRole === "aspirante"
              ? "border-red-700 bg-red-700 text-white ring-2 ring-red-200"
              : "border-red-200 bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <UserIcon className="h-5 w-5" />
          Aspirante
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("funcionario")}
          aria-pressed={userRole === "funcionario" ? true : false}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition shadow-sm ${
            userRole === "funcionario"
              ? "border-red-700 bg-red-700 text-white ring-2 ring-red-200"
              : "border-red-200 bg-white text-red-700 hover:bg-red-50"
          }`}
        >
          <BriefcaseIcon className="h-5 w-5" />
          Funcionario
        </button>
      </div>

      <div className="text-center animate-fade-in-up delay-100 rounded-md bg-red-700 p-4 text-white">
        <h1 className="text-2xl font-bold tracking-wide">¡Bienvenido!</h1>
        <p className="mt-1 text-sm text-red-100">
          Acceso para {userRole ? ROLE_LABELS[userRole] : "Aspirante"}
        </p>
      </div>

      {fieldErrors.userRole && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {fieldErrors.userRole}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {okMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {okMessage}
        </div>
      )}

      {userRole === "aspirante" ? (
        <div className="animate-fade-in-up">
          <label htmlFor="cedula" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <IdentificationIcon className="h-4 w-4 text-red-700" />
            Documento de identificación
          </label>
          <div className="rounded-md border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200">
            <InputField
              id="cedula"
              type="text"
              placeholder="1098765432"
              value={cedula}
              onChange={handleCedulaChange}
              autoComplete="off"
              disabled={loading}
            />
          </div>
          {fieldErrors.cedula && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.cedula}</p>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <label htmlFor="email" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <EnvelopeIcon className="h-4 w-4 text-red-700" />
            Correo institucional
          </label>
          <div className="rounded-md border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200">
            <InputField
              id="email"
              type="email"
              placeholder="nombre.apellido@ufps.edu.co"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          {email.length > 0 && (
            <p className={`mt-1 inline-flex items-center gap-1 text-xs ${mostrarErrorCorreo ? "text-red-600" : "text-emerald-700"}`}>
              {mostrarErrorCorreo ? (
                <ExclamationCircleIcon className="h-4 w-4" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              {mostrarErrorCorreo ? "Formato inválido. Ejemplo: nombre.apellido@ufps.edu.co" : "Correo válido"}
            </p>
          )}
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>
      )}

      <div className="animate-fade-in-up">
        <label htmlFor="password" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <LockClosedIcon className="h-4 w-4 text-red-700" />
          Contraseña
        </label>
        <div className="rounded-md border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200">
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
            {mostrarErrorPassword ? "Debe tener al menos 8 caracteres" : "Contraseña válida"}
          </p>
        )}
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <div className="mt-1 animate-fade-in-up flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-md bg-red-700 p-3 font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-400"
        >
          {loading && <Spinner />}
          {userRole === "aspirante" ? "Iniciar sesión Aspirante" : "Iniciar sesión Funcionario"}
        </button>
      </div>
    </form>
  );
}