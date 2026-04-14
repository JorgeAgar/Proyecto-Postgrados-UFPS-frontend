import { Link } from "react-router";

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
          <img
            src="src\assets\ufpslogo.png"
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
                  <option value="">
                    Seleccione...
                  </option>
                  <option value="PAIS13">AFGANISTAN</option>
                  <option value="PAIS17">ALBANIA</option>
                  <option value="PAIS23">ALEMANIA</option>
                  <option value="PAIS37">ANDORRA</option>
                  <option value="PAIS38">ANGOLA</option>
                  <option value="PAIS41">ANGUILLA</option>
                  <option value="PAIS43">ANTIGUA Y BARBUDA</option>
                  <option value="PAIS47">ANTILLAS HOLANDESAS</option>
                  <option value="PAIS53">ARABIA SAUDITA</option>
                  <option value="PAIS59">ARGELIA</option>
                  <option value="PAIS25">ARGENTINA</option>
                  <option value="PAIS26">ARMENIA</option>
                  <option value="PAIS27">ARUBA</option>
                  <option value="PAIS69">AUSTRALIA</option>
                  <option value="PAIS72">AUSTRIA</option>
                  <option value="PAIS74">AZERBAIJAN</option>
                  <option value="PAIS77">BAHAMAS</option>
                  <option value="PAIS80">BAHREIN</option>
                  <option value="PAIS81">BANGLADESH</option>
                  <option value="PAIS83">BARBADOS</option>
                  <option value="PAIS87">BELGICA</option>
                  <option value="PAIS88">BELICE</option>
                  <option value="PAIS91">BELORUS</option>
                  <option value="PAIS229">BENIN</option>
                  <option value="PAIS90">BERMUDAS</option>
                  <option value="PAIS93">BIRMANIA (MYANMAR)</option>
                  <option value="PAIS97">BOLIVIA</option>
                  <option value="PAIS29">BOSNIA-HERZEGOVINA</option>
                  <option value="PAIS101">BOTSWANA</option>
                  <option value="PAIS55">BRASIL</option>
                  <option value="PAIS108">BRUNEI DARUSSALAM</option>
                  <option value="PAIS111">BULGARIA</option>
                  <option value="PAIS31">BURKINA FASSO</option>
                  <option value="PAIS115">BURUNDI</option>
                  <option value="PAIS119">BUTAN</option>
                  <option value="PAIS127">CABO VERDE</option>
                  <option value="PAIS137">CAIMAN, ISLAS</option>
                  <option value="PAIS145">CAMERUN, REPUBLICA U</option>
                  <option value="PAIS149">CANADA</option>
                  <option value="PAIS155">CANAL(NORMANDAS),ISL</option>
                  <option value="PAIS157">CANTON ENDERBURY,ISL</option>
                  <option value="PAIS203">CHAD</option>
                  <option value="PAIS18">CHILE</option>
                  <option value="PAIS215">CHINA</option>
                  <option value="PAIS221">CHIPRE</option>
                  <option value="PAIS159">CIUDAD DEL VATICANO</option>
                  <option value="PAIS165">COCOS (KEELING), ISL</option>
                  <option value="PAIS1">COLOMBIA</option>
                  <option value="PAIS173">COMORAS</option>
                  <option value="PAIS998">COMUNIDAD EUROPEA</option>
                  <option value="PAIS177">CONGO</option>
                  <option value="PAIS183">COOK, ISLAS</option>
                  <option value="PAIS187">COREA DEL NORTE,REPU</option>
                  <option value="PAIS190">COREA DEL SUR, REPUB</option>
                  <option value="PAIS193">COSTA DE MARFIL</option>
                  <option value="PAIS196">COSTA RICA</option>
                  <option value="PAIS198">CROACIA</option>
                  <option value="PAIS199">CUBA</option>
                  <option value="PAIS789">CURACAO</option>
                  <option value="PAIS232">DINAMARCA</option>
                  <option value="PAIS783">DJIBOUTI</option>
                  <option value="PAIS235">DOMINICA</option>
                  <option value="PAIS3">ECUADOR</option>
                  <option value="PAIS240">EGIPTO</option>
                  <option value="PAIS242">EL SALVADOR</option>
                  <option value="PAIS244">EMIRATOS ARABES UNID</option>
                  <option value="PAIS243">ERITREA</option>
                  <option value="PAIS246">ESLOVAQUIA</option>
                  <option value="PAIS247">ESLOVENIA</option>
                  <option value="PAIS245">ESPAÑA</option>
                  <option value="PAIS24">ESTADOS UNIDOS</option>
                  <option value="PAIS251">ESTONIA</option>
                  <option value="PAIS253">ETIOPIA</option>
                  <option value="PAIS259">FEROE, ISLAS</option>
                  <option value="PAIS870">FIJI</option>
                  <option value="PAIS267">FILIPINAS</option>
                  <option value="PAIS271">FINLANDIA</option>
                  <option value="PAIS275">FRANCIA</option>
                  <option value="PAIS281">GABON</option>
                  <option value="PAIS285">GAMBIA</option>
                  <option value="PAIS286">GAZA Y JERICO</option>
                  <option value="PAIS287">GEORGIA</option>
                  <option value="PAIS289">GHANA</option>
                  <option value="PAIS293">GIBRALTAR</option>
                  <option value="PAIS297">GRANADA</option>
                  <option value="PAIS301">GRECIA</option>
                  <option value="PAIS305">GROENLANDIA</option>
                  <option value="PAIS309">GUADALUPE</option>
                  <option value="PAIS313">GUAM</option>
                  <option value="PAIS317">GUATEMALA</option>
                  <option value="PAIS325">GUAYANA FRANCESA</option>
                  <option value="PAIS329">GUINEA</option>
                  <option value="PAIS334">GUINEA - BISSAU</option>
                  <option value="PAIS331">GUINEA ECUATORIAL</option>
                  <option value="PAIS337">GUYANA</option>
                  <option value="PAIS341">HAITI</option>
                  <option value="PAIS345">HONDURAS</option>
                  <option value="PAIS351">HONG KONG</option>
                  <option value="PAIS355">HUNGRIA</option>
                  <option value="PAIS361">INDIA</option>
                  <option value="PAIS365">INDONESIA</option>
                  <option value="PAIS369">IRAK</option>
                  <option value="PAIS372">IRAN, REPUBLICA ISLA</option>
                  <option value="PAIS375">IRLANDA (EIRE)</option>
                  <option value="PAIS33">ISLA DE MAN</option>
                  <option value="PAIS379">ISLANDIA</option>
                  <option value="PAIS566">
                    ISLAS MENORES DE ESTADOS UNIDOS
                  </option>
                  <option value="PAIS383">ISRAEL</option>
                  <option value="PAIS386">ITALIA</option>
                  <option value="PAIS391">JAMAICA</option>
                  <option value="PAIS399">JAPON</option>
                  <option value="PAIS395">JOHNSTON,ISLA</option>
                  <option value="PAIS403">JORDANIA</option>
                  <option value="PAIS141">KAMPUCHEA (CAMBOYA)</option>
                  <option value="PAIS406">KAZAJSTAN</option>
                  <option value="PAIS410">KENYA</option>
                  <option value="PAIS412">KIRGUIZISTAN</option>
                  <option value="PAIS411">KIRIBATI</option>
                  <option value="PAIS413">KUWAIT</option>
                  <option value="PAIS420">LAOS,REPUBLICA POPUL</option>
                  <option value="PAIS426">LESOTHO</option>
                  <option value="PAIS429">LETONIA</option>
                  <option value="PAIS431">LIBANO</option>
                  <option value="PAIS434">LIBERIA</option>
                  <option value="PAIS438">LIBIA(INCLUYE FEZZAN</option>
                  <option value="PAIS440">LIECHTENSTEIN</option>
                  <option value="PAIS443">LITUANIA</option>
                  <option value="PAIS445">LUXEMBURGO</option>
                  <option value="PAIS447">MACAO</option>
                  <option value="PAIS448">MACEDONIA</option>
                  <option value="PAIS450">MADAGASCAR</option>
                  <option value="PAIS30">MALASIA</option>
                  <option value="PAIS458">MALAWI</option>
                  <option value="PAIS461">MALDIVAS</option>
                  <option value="PAIS464">MALI</option>
                  <option value="PAIS467">MALTA</option>
                  <option value="PAIS469">MARIANAS DEL NORTE,I</option>
                  <option value="PAIS474">MARRUECOS</option>
                  <option value="PAIS472">MARSHALL, ISLAS</option>
                  <option value="PAIS477">MARTINICA</option>
                  <option value="PAIS485">MAURICIO</option>
                  <option value="PAIS488">MAURITANIA</option>
                  <option value="PAIS75">MEXICO</option>
                  <option value="PAIS494">MICRONESIA,ESTADOS F</option>
                  <option value="PAIS495">MIDWAY, ISLAS</option>
                  <option value="PAIS496">MOLDAVIA</option>
                  <option value="PAIS498">MONACO</option>
                  <option value="PAIS497">MONGOLIA</option>
                  <option value="PAIS501">MONSERRAT, ISLA</option>
                  <option value="PAIS502">MONTENEGRO</option>
                  <option value="PAIS505">MOZAMBIQUE</option>
                  <option value="PAIS507">NAMIBIA</option>
                  <option value="PAIS508">NAURU</option>
                  <option value="PAIS511">NAVIDAD (CHRISTMAS)</option>
                  <option value="PAIS517">NEPAL</option>
                  <option value="PAIS521">NICARAGUA</option>
                  <option value="PAIS525">NIGER</option>
                  <option value="PAIS528">NIGERIA</option>
                  <option value="PAIS531">NIUE, ISLA</option>
                  <option value="PAIS2">NIVE ISLA</option>
                  <option value="PAIS999">NO DECLARADOS</option>
                  <option value="PAIS535">NORFOLK, ISLA</option>
                  <option value="PAIS538">NORUEGA</option>
                  <option value="PAIS542">NUEVA CALEDONIA</option>
                  <option value="PAIS548">NUEVA ZELANDIA</option>
                  <option value="PAIS556">OMAN</option>
                  <option value="PAIS573">PAISES BAJOS(HOLANDA</option>
                  <option value="PAIS576">PAKISTAN</option>
                  <option value="PAIS578">PALAU, ISLAS</option>
                  <option value="PAIS579">PALESTINA</option>
                  <option value="PAIS580">PANAMA</option>
                  <option value="PAIS545">PAPUASIA NUEV GUINEA</option>
                  <option value="PAIS586">PARAGUAY</option>
                  <option value="PAIS5">PERU</option>
                  <option value="PAIS593">PITCAIRN, ISLA</option>
                  <option value="PAIS599">POLINESIA FRANCESA</option>
                  <option value="PAIS603">POLONIA</option>
                  <option value="PAIS607">PORTUGAL</option>
                  <option value="PAIS611">PUERTO RICO</option>
                  <option value="PAIS618">QATAR</option>
                  <option value="PAIS628">REINO UNIDO</option>
                  <option value="PAIS640">REPUBLICA CENTROAFRI</option>
                  <option value="PAIS644">REPUBLICA CHECA</option>
                  <option value="PAIS888">
                    REPUBLICA DEMOCRATICA DEL CONGO
                  </option>
                  <option value="PAIS647">REPUBLICA DOMINICANA</option>
                  <option value="PAIS660">REUNION</option>
                  <option value="PAIS670">RUMANIA</option>
                  <option value="PAIS676">RUSIA</option>
                  <option value="PAIS675">RWANDA</option>
                  <option value="PAIS685">SAHARA OCCIDENTAL</option>
                  <option value="PAIS677">SALOMSN, ISLAS</option>
                  <option value="PAIS687">SAMOA</option>
                  <option value="PAIS690">SAMOA NORTEAMERICANA</option>
                  <option value="PAIS695">SAN CRISTOBAL Y NIEVES</option>
                  <option value="PAIS697">SAN MARINO</option>
                  <option value="PAIS700">SAN PEDRO Y MIGUELON</option>
                  <option value="PAIS705">SAN VICENTE Y LAS GR</option>
                  <option value="PAIS710">SANTA ELENA</option>
                  <option value="PAIS715">SANTA LUCIA</option>
                  <option value="PAIS720">SANTO TOME Y PRINCIP</option>
                  <option value="PAIS728">SENEGAL</option>
                  <option value="PAIS32">SERBIA</option>
                  <option value="PAIS731">SEYCHELLES</option>
                  <option value="PAIS735">SIERRA LEONA</option>
                  <option value="PAIS741">SINGAPUR</option>
                  <option value="PAIS744">SIRIA,REPUBLICA ARAB</option>
                  <option value="PAIS748">SOMALIA</option>
                  <option value="PAIS40">SOUTH AFRICA</option>
                  <option value="PAIS750">SRI LANKA</option>
                  <option value="PAIS759">SUDAN</option>
                  <option value="PAIS764">SUECIA</option>
                  <option value="PAIS767">SUIZA</option>
                  <option value="PAIS770">SURINAM</option>
                  <option value="PAIS773">SWAZILANDIA</option>
                  <option value="PAIS774">TADJIKISTAN</option>
                  <option value="PAIS776">TAILANDIA</option>
                  <option value="PAIS218">TAIWAN (FORMOSA)</option>
                  <option value="PAIS780">TANZANIA,REPUBLICA U</option>
                  <option value="PAIS786">TERRI ANTARTICO BRIT</option>
                  <option value="PAIS787">TERRITORI BRITANICO</option>
                  <option value="PAIS788">TIMOR DEL ESTE</option>
                  <option value="PAIS800">TOGO</option>
                  <option value="PAIS805">TOKELAU</option>
                  <option value="PAIS810">TONGA</option>
                  <option value="PAIS815">TRINIDAD Y TOBAGO</option>
                  <option value="PAIS820">TUNICIA</option>
                  <option value="PAIS823">TURCAS Y CAICOS,ISLA</option>
                  <option value="PAIS825">TURKMENISTAN</option>
                  <option value="PAIS827">TURQUIA</option>
                  <option value="PAIS828">TUVALU</option>
                  <option value="PAIS830">UCRANIA</option>
                  <option value="PAIS833">UGANDA</option>
                  <option value="PAIS845">URUGUAY</option>
                  <option value="PAIS847">UZBEKISTAN</option>
                  <option value="PAIS551">VANUATU</option>
                  <option value="PAIS15">VENEZUELA</option>
                  <option value="PAIS855">VIETNAM</option>
                  <option value="PAIS863">VIRGENES,ISLAS(BRITA</option>
                  <option value="PAIS866">VIRGENES,ISLAS(NORTE</option>
                  <option value="PAIS875">WALLIS Y FORTUNA,ISL</option>
                  <option value="PAIS880">YEMEN</option>
                  <option value="PAIS885">YUGOSLAVIA</option>
                  <option value="PAIS890">ZAMBIA</option>
                  <option value="PAIS665">ZIMBABWE</option>
                  <option value="PAIS895">ZONA CANAL DE PANAMA</option>
                  <option value="PAIS897">ZONA NEUTRAL(PALESTA</option>
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
