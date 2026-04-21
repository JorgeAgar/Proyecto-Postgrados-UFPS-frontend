import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

/**
 * Opciones disponibles para el tipo de documento de identidad.
 */
const documentos = [
  "Seleccione...",
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Tarjeta de Identidad",
  "Pasaporte",
  "NIT (Sin dígito de verificación)",
  "Permiso de Protección Temporal (PPT)",
];
const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Genero = {
  id: number;
  nombre: string;
}
const generos: Genero[] = await fetch(`${import.meta.env.VITE_API_URL}/v1/genero`).then((response) => response.json());

type ProgramaPosgrado = {
  codigo: number;
  correoPrograma: string;
  id: number;
  nombrePrograma: string;
}
type cohorte = {
  id: number;
  nombre: string;
}
type cohorteReq = {
  cohorte: cohorte;
  cupos: number;
  id: number;
  idCohorte: number;
  idPrograma: number;
  programaposgrado: ProgramaPosgrado;
}
const cohortes: cohorteReq[] = await fetch(`${import.meta.env.VITE_API_URL}/v1/ofertaacademica`).then((response) => response.json());

type Departamento = {
  id: number;
  idPais: number;
  nombre: string;
}
type Pais = {
  codigo: string;
  departamentoList: Departamento[];
  id: number;
  nombre: string;
  residenciaList: [];
}
const paisesResidencia: Pais[] = await fetch(`${import.meta.env.VITE_API_URL}/v1/pais`).then((response) => response.json());
console.log("Paises de residencia:", paisesResidencia);

/**
 * Props compartidas por los campos con etiqueta del formulario.
 */
type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * Envuelve un control de formulario con su etiqueta y estado requerido.
 */
function Field({ label, required, children, className = "" }: FieldProps) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[15px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-slate-700"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

/**
 * Props para un campo de texto reutilizable.
 */
type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  wrapperClassName?: string;
};

/**
 * Campo de entrada de texto con el estilo visual del formulario.
 */
function TextField({
  label,
  required,
  wrapperClassName,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} required={required} className={wrapperClassName}>
      <input
      required={required}
        {...props}
        className={`h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`.trim()}
      />
    </Field>
  );
}

/**
 * Props para un selector reutilizable.
 */
type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
  wrapperClassName?: string;
};

/**
 * Campo de selección con la misma estructura visual que los inputs.
 */
function SelectField({
  label,
  required,
  wrapperClassName,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  return (
    <Field label={label} required={required} className={wrapperClassName}>
      <select
        {...props}
        className={`h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`.trim()}
      >
        {children}
      </select>
    </Field>
  );
}

/**
 * Props para los mensajes informativos del formulario.
 */
type NoticeBoxProps = {
  children: React.ReactNode;
};

/**
 * Regla de validación de la contraseña.
 */
type PasswordRule = {
  label: string;
  isValid: boolean;
};

/**
 * Valida la contraseña contra las reglas mínimas requeridas por el formulario.
 *
 * @param password - Valor actual de la contraseña.
 * @returns Lista de reglas con su estado de cumplimiento.
 */
function validatePassword(password: string): PasswordRule[] {
  return [
    {
      label: "Al menos debería tener una letra",
      isValid: /[a-zA-Z]/.test(password),
    },
    {
      label: "Al menos debería tener una letra en mayúsculas",
      isValid: /[A-Z]/.test(password),
    },
    {
      label: "Al menos debería tener una letra en minúscula",
      isValid: /[a-z]/.test(password),
    },
    {
      label: "Al menos debería tener un número",
      isValid: /\d/.test(password),
    },
    {
      label: "Debería tener 8 caracteres como mínimo",
      isValid: password.length >= 8,
    },
  ];
}

/**
 * Caja de aviso reutilizable para observaciones o advertencias.
 */
function NoticeBox({ children }: NoticeBoxProps) {
  return (
    <div className="rounded-sm border border-sky-200 bg-sky-100/90 px-4 py-3 text-[15px] leading-6 text-sky-800">
      {children}
    </div>
  );
}

/**
 * Renderiza el formulario de inscripción de postgrados.
 */
export function Formulario() {
  const [clave, setClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");

  let navigate = useNavigate();

  const reglasClave = validatePassword(clave);
  const mostrarValidacionClave = clave.length > 0;
  const clavesCoinciden = clave === confirmarClave;
  const claveValida = reglasClave.every((regla) => regla.isValid);
  const formularioValido = claveValida && clavesCoinciden;
  const paisIdSeleccionado = Number(paisSeleccionado);
  const departamentosResidencia = paisesResidencia.find(
    (pais) => pais.id === paisIdSeleccionado,
  )?.departamentoList ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formularioValido) {
      return;
    }
    
    console.log("enviar y validar form");
    // 1. post aspirante
    // fetch(`${import.meta.env.VITE_API_URL}/v1/aspirante`, {

    // })
    // 2. post usuario
    // 3. post usuario-aspirante
    navigate("/aspirante/inicio");
  };

  return (
    <>
      <header className="bg-linear-to-l from-red-500 from-50% to-red-800 py-4">
        <div className="ml-32 flex flex-row gap-16">
          <img
            src="src\assets\logoufps.png"
            alt="Logo UFPS"
            className="size-24 -rotate-10 transform scale-125 translate-y-4"
          />
          <Link to="/">
            <h2 className="text-white font-bold text-xl">
              Universidad Francisco de Paula Santander
            </h2>
            <h2 className="text-white font-bold text-xl">Inscripciones</h2>
          </Link>
        </div>
      </header>
      <main className="min-h-screen bg-slate-50 px-3 py-3 text-slate-800 sm:px-4 sm:py-4 flex items-center justify-center">
        <div className="w-fit">
          <h1 className="text-4xl mb-4">Formulario de Registro</h1>
          <div className="rounded-sm border border-red-200 bg-red-100 px-4 py-3 text-[15px] leading-6 text-black mb-4">
            <b>Tenga en cuenta lo siguiente:</b>
            <ul className="list-disc pl-4 ml-4">
              <li>
                Los campos acompañados de un asterisco (*) deben ser
                diligenciados obligatoriamente para poder terminar con éxito el
                formulario de registro.
              </li>
            </ul>
          </div>
          <section className="mx-auto max-w-375 rounded-md border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-4">
            <NoticeBox>
              Es importante que el número del documento de identidad quede
              registrado correctamente en su proceso de inscripción, de lo
              contrario podrá perder la información y pagos registrados.
            </NoticeBox>

            <form className="mt-4 flex flex-col gap-8" onSubmit={(e) => handleSubmit(e)}>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
                  <SelectField
                    label="Documento"
                    required
                    defaultValue=""
                    className="w-full"
                    id="tipoDoc"
                    name="tipoDoc"
                  >
                    <option value="" disabled hidden>
                      Seleccione...
                    </option>
                    {documentos.map((documento) => (
                      <option key={documento} value={documento}>
                        {documento}
                      </option>
                    ))}
                  </SelectField>

                  <TextField
                    label="No. Documento"
                    required
                    placeholder="No. Documento"
                    type="text"
                    className="w-full"
                    id="numDoc"
                    name="numDoc"
                    minLength={6}
                    maxLength={15}
                  />
                </div>
                <TextField
                  label="Lugar de expedición"
                  required
                  placeholder="Lugar de expedicion"
                  type="text"
                  id="lugarExpedicion"
                  name="lugarExpedicion"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Primer Nombre"
                  required
                  placeholder="Primer Nombre"
                  type="text"
                  id="primerNombre"
                  name="primerNombre"
                />

                <TextField
                  label="Segundo Nombre"
                  placeholder="Segundo Nombre"
                  type="text"
                  id="segundoNombre"
                  name="segundoNombre"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Primer Apellido"
                  required
                  placeholder="Primer Apellido"
                  type="text"
                  id="primerApellido"
                  name="primerApellido"
                />

                <TextField
                  label="Segundo Apellido"
                  required
                  placeholder="Segundo Apellido"
                  type="text"
                  id="segundoApellido"
                  name="segundoApellido"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="w-full">
                  <span className="mb-1.5 block text-[15px] font-semibold text-slate-700">
                    Fecha de Nacimiento
                    <span className="text-slate-700"> *</span>
                  </span>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
                    <input
                      required
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Día"
                      type="number"
                      min="1"
                      max="31"
                      id="diaNacimiento"
                      name="diaNacimiento"
                    />

                    <select
                      required
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      defaultValue=""
                      id="mesNacimiento"
                      name="mesNacimiento"
                    >
                      <option value="" disabled hidden>
                        Seleccione...
                      </option>
                      {meses.map((mes) => (
                        <option key={mes} value={mes}>
                          {mes}
                        </option>
                      ))}
                    </select>

                    <input
                      required
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Año"
                      type="number"
                      min="1900"
                      max="2100"
                      id="anioNacimiento"
                      name="anioNacimiento"
                    />
                  </div>
                </div>
                <TextField
                  label="Lugar de nacimiento"
                  required
                  placeholder="Lugar de nacimiento"
                  type="text"
                  id="lugarNacimiento"
                  name="lugarNacimiento"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Número móvil"
                  required
                  placeholder="Número móvil"
                  type="tel"
                  id="numMovil"
                  name="numMovil"
                />
                <TextField
                  label="Correo electrónico"
                  required
                  placeholder="Correo electrónico"
                  type="email"
                  id="correoElectronico"
                  name="correoElectronico"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <SelectField
                  label="Género"
                  required
                  defaultValue=""
                  id="genero"
                  name="genero"
                >
                  <option value="" disabled hidden>
                    Seleccione...
                  </option>
                  {generos.map((genero) => (
                    <option key={genero.id} value={genero.id}>
                      {genero.nombre}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Cohorte"
                  required
                  defaultValue=""
                  id="cohorte"
                  name="cohorte"
                >
                  <option value="" disabled hidden>
                    Seleccione...
                  </option>
                  {cohortes.map((cohorte) => (
                    <option key={cohorte.id} value={cohorte.id}>
                      {cohorte.cohorte.nombre} - {cohorte.programaposgrado.nombrePrograma}
                    </option>
                  ))}
                </SelectField>
              </div>

              <NoticeBox>
                El email registrado es el medio oficial de comunicación entre la
                Universidad y el aspirante, motivo por la cual deberá tener
                cuidado al momento de digitarlo.
              </NoticeBox>

              <div className="grid gap-8 md:grid-cols-2">
                <SelectField
                  label="País de Residencia"
                  required
                  value={paisSeleccionado}
                  onChange={(event) => {
                    setPaisSeleccionado(event.target.value);
                    setDepartamentoSeleccionado("");
                  }}
                  id="paisResidencia"
                  name="paisResidencia"
                >
                  <option value="" disabled hidden>
                    Seleccione...
                  </option>
                  {paisesResidencia.map((pais) => (
                    <option key={pais.codigo} value={pais.id}>
                      {pais.nombre}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Departamento de Residencia"
                  required
                  value={departamentoSeleccionado}
                  onChange={(event) => setDepartamentoSeleccionado(event.target.value)}
                  id="departamentoResidencia"
                  name="departamentoResidencia"
                  disabled={!paisSeleccionado}
                >
                  <option value="" disabled hidden>
                    {paisSeleccionado ? "Seleccione..." : "Seleccione un país primero"}
                  </option>
                  {departamentosResidencia.map((departamento) => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <SelectField
                  label="Municipio de Residencia"
                  required
                  defaultValue=""
                  id="municipioResidencia"
                  name="municipioResidencia"
                >
                  <option value="" disabled hidden>
                    Seleccione...
                  </option>
                  <option value="Colombia">Colombia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Perú">Perú</option>
                </SelectField>

                {/* <SelectField
                  label="Barrio de Residencia"
                  required
                  defaultValue="Seleccione..."
                  id="barrioResidencia"
                  name="barrioResidencia"
                >
                  <option value="Seleccione...">Seleccione...</option>
                  <option value="Cúcuta">Cúcuta</option>
                  <option value="Ocaña">Ocaña</option>
                  <option value="Pamplona">Pamplona</option>
                </SelectField> */}
              </div>

              <TextField
                label="Dirección"
                required
                placeholder="Dirección"
                type="text"
                id="direccion"
                name="direccion"
              />

              <div className="w-full">
                <TextField
                  label="Clave (Utilice al menos una mayúscula, una minúscula, un número y un caracter especial. Minimo 8 caracteres)"
                  required
                  minLength={8}
                  maxLength={32}
                  placeholder="Clave"
                  type="password"
                  id="clave"
                  name="clave"
                  value={clave}
                  onChange={(event) => setClave(event.target.value)}
                />
                {mostrarValidacionClave ? (
                  <div className="mt-1.5 space-y-1 text-sm leading-6">
                    {reglasClave.map((regla) => (
                      <p
                        key={regla.label}
                        className={
                          regla.isValid ? "text-green-700" : "text-red-600"
                        }
                      >
                        {regla.label}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="w-full">
                <TextField
                  label="Confirmar clave"
                  required
                  minLength={8}
                  maxLength={32}
                  placeholder="Confirmar clave"
                  type="password"
                  id="confirmarClave"
                  name="confirmarClave"
                  value={confirmarClave}
                  onChange={(event) => setConfirmarClave(event.target.value)}
                />
                {!clavesCoinciden ? (
                  <p className="mt-1.5 text-sm text-red-600">
                    Las claves no coinciden.
                  </p>
                ) : null}
              </div>
              <NoticeBox>
                <ul className="list-disc pl-4">
                  <li>
                    Recuerde que es su responsabilidad la veracidad de la
                    información aquí suministrada.
                  </li>
                  <li>
                    Al momento de dar clic en el botón Registrarme, se le
                    enviará a su correo un enlace que deberá ser confirmado para
                    terminar exitosamente el registro del formulario.
                  </li>
                </ul>
              </NoticeBox>
              <div className="border-t border-slate-200 pt-5">
                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-sm bg-[#428bca] pl-3 pr-4 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-[#3071a9]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 mr-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                      />
                    </svg>
                    Registrarme
                  </button>
                  <button
                    type="button"
                    onClick={() => console.log("Cancelar")}
                    className="inline-flex h-10 items-center rounded-sm bg-[#d9534f] pl-3 pr-4 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-[#c9302c]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 mr-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default Formulario;
