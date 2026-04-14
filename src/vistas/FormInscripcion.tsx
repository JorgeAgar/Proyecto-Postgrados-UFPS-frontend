import { Link } from "react-router";

const documentos = [
  "Seleccione...",
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Tarjeta de identidad",
  "Pasaporte",
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

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

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

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  wrapperClassName?: string;
};

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
        {...props}
        className={`h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`.trim()}
      />
    </Field>
  );
}

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
  wrapperClassName?: string;
};

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

type NoticeBoxProps = {
  children: React.ReactNode;
};

function NoticeBox({ children }: NoticeBoxProps) {
  return (
    <div className="rounded-sm border border-sky-200 bg-sky-100/90 px-4 py-3 text-[15px] leading-6 text-sky-800">
      {children}
    </div>
  );
}

export function Formulario() {
  return (
    <>
      <header className="bg-linear-to-l from-red-500 from-50% to-red-800 py-4">
        <div className="ml-32 flex flex-row gap-16">
          <img src="src\assets\ufpslogo.png" alt="Logo UFPS" className="size-16 -rotate-10 transform scale-200 translate-y-8" />
          <Link to="/">
            <h2 className="text-white font-bold text-xl">Universidad Francisco de Paula Santander</h2>
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

            <form className="mt-4 flex flex-col gap-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
                  <SelectField
                    label="Documento"
                    required
                    defaultValue="Seleccione..."
                    className="w-full"
                  >
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
                  />
                </div>
                <TextField
                  label="Lugar de expedición"
                  required
                  placeholder="Lugar de expedicion"
                  type="text"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Primer Nombre"
                  required
                  placeholder="Primer Nombre"
                  type="text"
                />

                <TextField
                  label="Segundo Nombre"
                  placeholder="Segundo Nombre"
                  type="text"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Primer Apellido"
                  required
                  placeholder="Primer Apellido"
                  type="text"
                />

                <TextField
                  label="Segundo Apellido"
                  required
                  placeholder="Segundo Apellido"
                  type="text"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="w-full">
                  <span className="mb-1.5 block text-[15px] font-semibold text-slate-700">
                    Fecha de Nacimiento{" "}
                    <span className="text-slate-700">*</span>
                  </span>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
                    <input
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Día"
                      type="number"
                      min="1"
                      max="31"
                    />

                    <select
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      defaultValue="Enero"
                    >
                      {meses.map((mes) => (
                        <option key={mes} value={mes}>
                          {mes}
                        </option>
                      ))}
                    </select>

                    <input
                      className="h-9 w-full rounded-none border border-slate-200 bg-white px-3 text-[15px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Año"
                      type="text"
                    />
                  </div>
                </div>
                <TextField
                  label="Lugar de nacimiento"
                  required
                  placeholder="Lugar de nacimiento"
                  type="text"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <TextField
                  label="Número móvil"
                  required
                  placeholder="Número móvil"
                  type="tel"
                />
                <TextField
                  label="Correo electrónico"
                  required
                  placeholder="Correo electrónico"
                  type="email"
                />
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
                  defaultValue="Seleccione..."
                >
                  <option value="Seleccione...">Seleccione...</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Perú">Perú</option>
                </SelectField>

                <SelectField
                  label="Departamento de Residencia"
                  required
                  defaultValue="Seleccione..."
                >
                  <option value="Seleccione...">Seleccione...</option>
                  <option value="Cúcuta">Cúcuta</option>
                  <option value="Ocaña">Ocaña</option>
                  <option value="Pamplona">Pamplona</option>
                </SelectField>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <SelectField
                  label="Municipio de Residencia"
                  required
                  defaultValue="Seleccione..."
                >
                  <option value="Seleccione...">Seleccione...</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Perú">Perú</option>
                </SelectField>

                <SelectField
                  label="Barrio de Residencia"
                  required
                  defaultValue="Seleccione..."
                >
                  <option value="Seleccione...">Seleccione...</option>
                  <option value="Cúcuta">Cúcuta</option>
                  <option value="Ocaña">Ocaña</option>
                  <option value="Pamplona">Pamplona</option>
                </SelectField>
              </div>

              <TextField
                label="Dirección"
                required
                placeholder="Dirección"
                type="text"
              />

              <div className="w-full">
                <TextField
                  label="Clave (Utilice al menos una mayúscula, una minúscula, un número y un caracter especial. Minimo 8 caracteres)"
                  required
                  placeholder="Clave"
                  type="password"
                />
              </div>
              <div className="w-full">
                <TextField
                  label="Confirmar clave"
                  required
                  placeholder="Confirmar clave"
                  type="password"
                />
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
                    type="button"
                    onClick={() => console.log("Registrarme")}
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
