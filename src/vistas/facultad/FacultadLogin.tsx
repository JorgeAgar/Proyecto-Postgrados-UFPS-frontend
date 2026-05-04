import { useState, type HTMLInputTypeAttribute } from "react";
import ufpsLogo from "../../assets/logoufps.png";
import flujoabs from "../../assets/flujoabs.jpg";
import { logearFacultad } from "../../services/facultadService.ts";

/**
 * Vista de login para el director de facultad
 * @returns 
 */
export function FacultadLogin() {
  return (
    <main
      className="flex flex-col gap-4 animate-fade-in min-h-screen w-full relative overflow-hidden bg-linear-to-b bg-no-repeat bg-cover bg-center from-red-50 via-white to-gray-100"
      style={{ backgroundImage: `url(${flujoabs})` }}
    >
      <header
        className="animate-slide-left delay-200 flex items-center gap-5 px-8 py-5"
        min-h-30
      >
        <img
          src={ufpsLogo}
          alt="Universidad Francisco de Paula Santander"
          className="h-14 w-auto"
        />
      </header>
      <div className="flex items-center justify-center px-4 pb-10">
        <FormularioLogin
          rol="Facultad"
          loginInput={
            <InputGenerico
              inputType="text"
              label="Username"
              placeholder="Username por ahora"
              image={<span className="text-red-700">{idLogo}</span>}
            />
          }
        />
      </div>
    </main>
  );
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const fd = new FormData(form);
  const username = String(fd.get("username") ?? "");
  const password = String(fd.get("password") ?? "");

  logearFacultad(username, password);
}

/**
 * Componente de formulario genérico para login, con inputs personalizados y un diseño consistente (Es la parte del rectángulo blanco).
 * @param rol el rol de que es el login.
 * @param loginInput el input específico del login, debería ser un componente InputGenerico.
 * @returns 
 */
function FormularioLogin({
  rol,
  loginInput,
}: {
  rol: string;
  loginInput: React.ReactNode;
}) {
  return (
    <div
      className="
            flex
            flex-col
            gap-2
            bg-white
            rounded-xl
            shadow-[0_8px_40px_rgba(0,0,0,0.15)]
            p-8
            w-full
            max-w-90
            animate-fade-in-up
            delay-200
          "
    >
      <div className="text-center animate-fade-in-up delay-100 rounded-md bg-red-700 p-4 text-white">
        <h1 className="text-2xl font-bold tracking-wide">¡Bienvenido!</h1>
        <p className="mt-1 text-sm text-red-100">Acceso para {rol}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full flex flex-col gap-4 animate-fade-in-up"
      >
        {loginInput}
        <ContrasenaInput />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-md bg-red-700 p-3 font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-400"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

/**
 * Componente genérico para inputs de formulario, con label e imagen opcional.
 * @param inputType el tipo de input del input tag html en sí
 * @param label el nombre del input, tamibién se usa para identificarlo en el form
 * @param placeholder el placeholder del input
 * @param image, imagen opcional para poner al lado del label (toca ajustar el tamaño de lo que se pase por aquí)
 * @returns 
 */
function InputGenerico({
  inputType,
  label,
  placeholder,
  image,
}: {
  inputType: HTMLInputTypeAttribute;
  label: string;
  placeholder: string;
  image?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up w-full">
      <label
        htmlFor={label.toLowerCase()}
        className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700"
      >
        {image}
        {label}
      </label>
      <input
        type={inputType}
        placeholder={placeholder}
        id={label.toLowerCase()}
        name={label.toLowerCase()}
        className="rounded-md border border-gray-200 bg-gray-50 w-full p-3"
      />
    </div>
  );
}

/**
 * Componente específico para el input de contraseña, con funcionalidad de mostrar/ocultar contraseña.
 * @returns Componente de input de contraseña con label, el input y botón para ver la contraseña
 */
function ContrasenaInput() {
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <div className="animate-fade-in-up">
      <label
        htmlFor="password"
        className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700"
      >
        {LockClosedIcon}
        Contraseña
      </label>

      <div className="flex flex-row flex-nowrap justify-between items-stretch gap-1 rounded-md border border-gray-200 bg-gray-50">
        <input
          type={verContrasena ? "text" : "password"}
          id="password"
          name="password"
          placeholder="MiClaveSegura2026*"
          autoComplete="current-password"
          className="p-3 w-full"
        />
        <button
          type="button"
          onClick={() => setVerContrasena(!verContrasena)}
          className="size-12 flex flex-row justify-center items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        >
          {verContrasena ? eyeSlash : eye}
        </button>
      </div>
    </div>
  );
}

const idLogo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
    />
  </svg>
);

const LockClosedIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4 text-red-700"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

const eye = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const eyeSlash = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);
