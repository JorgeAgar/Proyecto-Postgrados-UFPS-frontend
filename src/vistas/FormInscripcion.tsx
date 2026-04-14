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
    <main className="min-h-screen bg-slate-50 px-3 py-3 text-slate-800 sm:px-4 sm:py-4">
      <section className="mx-auto max-w-375 rounded-md border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-4">
        <NoticeBox>
          Es importante que el número del documento de identidad quede
          registrado correctamente en su proceso de inscripción, de lo contrario
          podrá perder la información y pagos registrados.
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
                Fecha de Nacimiento <span className="text-slate-700">*</span>
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
            Universidad y el aspirante, motivo por la cual deberá tener cuidado
            al momento de digitarlo.
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
                Al momento de dar clic en el botón Registrarme, se le enviará a
                su correo un enlace que deberá ser confirmado para terminar
                exitosamente el registro del formulario.
              </li>
            </ul>
          </NoticeBox>
        </form>
      </section>
    </main>
  );
}

export default Formulario;
