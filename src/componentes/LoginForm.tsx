import { useState } from "react";
import { Link, useNavigate } from "react-router";
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

const MOCK_LOGIN_ENABLED = true;

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

function BriefcaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16a1 1 0 011 1v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 9l10-5 10 5-10 5-10-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 15a4 4 0 015 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 13h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>("aspirante");
  const [email, setEmail] = useState("");
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleCedulaChange = (value: string) => {
    setCedula(value.replace(/\D/g, ""));
    setFieldErrors((prev) => ({ ...prev, cedula: undefined }));
    setError(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setFieldErrors({});
    setError(null);
    setSuccessMessage(null);
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
      nextErrors.password = "La contraseña es obligatoria.";
    } else if (normalizedPassword.length < 8) {
      nextErrors.password = "La contraseña debe tener minimo 8 caracteres.";
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

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payload =
      userRole === "funcionario"
        ? {
            userRole,
            email: email.trim().toLowerCase(),
            password: password.trim(),
          }
        : {
            userRole,
            cedula: cedula.trim(),
            password: password.trim(),
          };

    try {
      if (MOCK_LOGIN_ENABLED) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (userRole === "funcionario") {
          saveMockSession({
            userRole,
            displayName: "Funcionario UFPS",
            email: email.trim().toLowerCase(),
            loginAt: new Date().toISOString(),
          });
          navigate("/funcionario/home");
          return;
        }

        // Flujo aspirante: guardar sesión y redirigir al layout con sidebar
        saveMockSession({
          userRole,
          displayName: "Usuario Demo",
          cedula: cedula.trim(),
          loginAt: new Date().toISOString(),
        });
        navigate("/aspirante/inicio");
        return;
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Credenciales invalidas. Verifica e intenta de nuevo.");
        return;
      }

      if (userRole === "funcionario") {
        saveMockSession({
          userRole,
          displayName: "Funcionario UFPS",
          email: email.trim().toLowerCase(),
          loginAt: new Date().toISOString(),
        });
        navigate("/funcionario/home");
        return;
      }

      // Flujo aspirante (API real): guardar sesión y redirigir
      if (userRole === "aspirante") {
        saveMockSession({
          userRole,
          displayName: "Usuario Demo",
          cedula: cedula.trim(),
          loginAt: new Date().toISOString(),
        });
        setSuccessMessage(`Inicio de sesion exitoso como ${ROLE_LABELS[userRole]}.`);
        navigate("/aspirante/inicio");
        return;
      }


    } catch {
      setError("No se pudo conectar con el servidor. Intenta mas tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
      <div className="text-center animate-fade-in-up bg-red-700 text-white rounded-md p-4">
        <h1 className="text-2xl font-bold tracking-wide">Bienvenido</h1>
        <p className="text-xs mt-1 text-red-100">Selecciona tu perfil para ingresar</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-md text-sm border animate-fade-in bg-red-50 border-red-200 text-red-900">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="px-4 py-3 rounded-md text-sm border border-green-200 bg-green-50 text-green-800 animate-fade-in">
          {successMessage}
        </div>
      )}

      <fieldset className="animate-fade-in-up bg-gray-50 rounded-md border border-gray-200 p-3">
        <legend className="px-1 text-sm font-semibold text-gray-700">Tipo de acceso</legend>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(["funcionario", "aspirante"] as UserRole[]).map((role) => {
            const isSelected = userRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                disabled={loading}
                className={[
                  "rounded-md border px-3 py-2 text-left transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
                  isSelected
                    ? "bg-red-700 border-red-700 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-700",
                ].join(" ")}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {role === "funcionario" ? <BriefcaseIcon /> : <CapIcon />}
                  {ROLE_LABELS[role]}
                </span>
              </button>
            );
          })}
        </div>
        {fieldErrors.userRole && <p className="mt-2 text-xs text-red-700">{fieldErrors.userRole}</p>}
      </fieldset>

      {userRole === "funcionario" ? (
        <div className="animate-fade-in-up">
          <label htmlFor="email" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MailIcon />
            Correo institucional
          </label>
          <div className="bg-gray-50 rounded-md border border-gray-200">
            <InputField
              id="email"
              type="email"
              placeholder="funcionario@ufps.edu.co"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
                setError(null);
              }}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <label htmlFor="cedula" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <IdCardIcon />
            Cédula
          </label>
          <div className="bg-gray-50 rounded-md border border-gray-200">
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
          {fieldErrors.cedula && <p className="mt-1 text-xs text-red-700">{fieldErrors.cedula}</p>}
        </div>
      )}

      <div className="animate-fade-in-up">
        <label htmlFor="password" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <LockIcon />
          contraseña
        </label>
        <div className="bg-gray-50 rounded-md border border-gray-200">
          <InputField
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
              setError(null);
            }}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        {fieldErrors.password && <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>}
      </div>

      <div className="mt-1 animate-fade-in-up flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 text-white font-bold bg-red-700 rounded-md p-3 hover:bg-red-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-400"
        >
          {loading && <Spinner />}
          {loading ? "Validando..." : `Iniciar como ${ROLE_LABELS[userRole]}`}
        </button>
      </div>
    </form>
  );
}
