import { useState } from "react";
import { useNavigate } from "react-router";
import InputField from "../../components/InputField";
import ufpsLogo from "../../assets/logoufps.png";
import flujoabs from "../../assets/flujoabs.jpg";
import { comiteAuthService } from "../../services/comiteService";

// ── Íconos inline ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
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

function CommitteeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

// function CheckCircleIcon() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//     </svg>
//   );
// }

function ExclamationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function LoginComiteCurricular() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const mostrarErrorUsername = !!fieldErrors.username;
  const mostrarErrorPassword = !!fieldErrors.password;

  const validate = () => {
    const errs: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errs.username = "El usuario es obligatorio.";
    }
    if (!password.trim()) {
      errs.password = "La contraseña es obligatoria.";
    } else if (password.trim().length < 6) {
      errs.password = "Mínimo 6 caracteres.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Revisa los campos marcados para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await comiteAuthService.login(username.trim(), password);
      navigate("/comite");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenciales inválidas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in min-h-screen w-full relative overflow-hidden bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${flujoabs})` }}
    >
      {/* ── Logos institucionales ── */}
      <div className="relative flex flex-col w-full min-h-[120px]">
        <div className="animate-slide-left delay-200 flex items-center gap-5 px-8 py-5">
          <img
            src={ufpsLogo}
            alt="Universidad Francisco de Paula Santander"
            className="h-14 w-auto"
          />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded px-3 py-2 border border-gray-200">
            <span className="text-xl font-extrabold leading-none" style={{ color: "var(--ufps-red)" }}>
              UFPS
            </span>
            <span className="text-[9px] text-gray-500 font-semibold mt-0.5 text-center leading-tight">
              Universidad Francisco de<br />Paula Santander
            </span>
          </div>
        </div>
      </div>

      {/* ── Tarjeta flotante ── */}
      <div className="flex items-center justify-center px-4 pb-10">
        <div className="bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-8 w-full max-w-[360px] animate-fade-in-up delay-200">
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">

            {/* Header de rol */}
            <div className="text-center animate-fade-in-up rounded-md bg-red-700 text-white p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CommitteeIcon />
                <h1 className="text-2xl font-bold tracking-wide">Comité Curricular</h1>
              </div>
              <p className="text-xs mt-1 text-red-100">
                Acceso al panel de admisión y evaluación
              </p>
            </div>

            {/* Banner demo */}
            {/* removed: backend real activo */}

            {/* Error global */}
            {error && (
              <div className="px-4 py-3 rounded-md text-sm border animate-fade-in bg-red-50 border-red-200 text-red-900">
                {error}
              </div>
            )}

            {/* Campo usuario */}
            <div className="animate-fade-in-up">
              <label htmlFor="cc-username" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-red-700"><EnvelopeIcon /></span>
                Usuario
              </label>
              <div className="rounded-md border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200">
                <InputField
                  id="cc-username"
                  type="text"
                  placeholder="nombre.apellido"
                  value={username}
                  onChange={(v) => { setUsername(v); setFieldErrors(p => ({ ...p, username: undefined })); setError(null); }}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              {mostrarErrorUsername && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                  <ExclamationIcon />
                  {fieldErrors.username ?? "Campo obligatorio"}
                </p>
              )}
            </div>

            {/* Campo contraseña */}
            <div className="animate-fade-in-up">
              <label htmlFor="cc-password" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-red-700"><LockIcon /></span>
                Contraseña
              </label>
              <div className="rounded-md border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200">
                <InputField
                  id="cc-password"
                  type="password"
                  placeholder="MiClaveSegura2026*"
                  value={password}
                  onChange={(v) => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); setError(null); }}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {mostrarErrorPassword && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                  <ExclamationIcon />
                  {fieldErrors.password ?? "Mínimo 6 caracteres"}
                </p>
              )}
            </div>

            {/* ¿Olvidaste tu contraseña? — navega a /recuperar-password sin recargar la página */}
            <div className="text-right -mt-1 -mb-2">
              <button
                type="button"
                className="text-xs text-red-700 hover:text-red-900 hover:underline transition-colors"
                onClick={() =>
                  navigate(
                    "/recuperar-password?loginRuta=/comite/login&rol=Comité Curricular"
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón submit */}
            <div className="mt-1 animate-fade-in-up">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full text-white font-bold bg-red-700 rounded-md p-3 hover:bg-red-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {loading && <Spinner />}
                {loading ? "Validando..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}