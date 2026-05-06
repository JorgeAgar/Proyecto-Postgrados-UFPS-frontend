import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { programaApiFetch } from "../../services/programaService";

type InitialShape = {
  encuentros?: string;
  cupos?: number;
  idPrograma?: number;
  idModalidad?: number;
  idJornada?: number;
  idCohorte?: number;
  idPlazo?: number;
  fechainicio?: string;
  fechafin?: string;
  ofertaId?: number;
};

type Option = { id: number; nombre?: string };

export default function CohorteForm({
  mode,
  initial,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: InitialShape;
  onSaved?: () => void;
}) {
  const navigate = useNavigate();

  // consolidate form state into one object to avoid multiple setState calls inside effects
  type FormState = {
    encuentros: string;
    cupos: number | "";
    idPrograma: number | "";
    idModalidad: number | "";
    idJornada: number | "";
    idCohorte: number | "";
    idPlazo: number | "";
    fechainicio: string;
    fechafin: string;
    ofertaId?: number;
  };

  const [form, setForm] = useState<FormState>(() => ({
    encuentros: initial?.encuentros ?? "",
    cupos: initial?.cupos ?? "",
    idPrograma: initial?.idPrograma ?? "",
    idModalidad: initial?.idModalidad ?? "",
    idJornada: initial?.idJornada ?? "",
    idCohorte: initial?.idCohorte ?? "",
    idPlazo: initial?.idPlazo ?? "",
    fechainicio: initial?.fechainicio ?? "",
    fechafin: initial?.fechafin ?? "",
    ofertaId: initial?.ofertaId,
  }));

  // catalogs
  const [programas, setProgramas] = useState<Option[]>([]);
  const [modalidades, setModalidades] = useState<Option[]>([]);
  const [jornadas, setJornadas] = useState<Option[]>([]);
  const [plazos, setPlazos] = useState<Option[]>([]);
  const [cohortes, setCohortes] = useState<Option[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Note: avoid synchronously setting state inside an effect to satisfy lint rules.
  // The component is remounted with a `key` when `initial` changes (see EditarCohorte),
  // so the initial state initializer above will pick up the provided `initial`.

  useEffect(() => {
    let mounted = true;
    async function loadCatalogs() {
      try {
        const [pList, modList, jornadaList, plazoList, cohorteList] = await Promise.all([
          programaApiFetch<unknown>("/api/dev/endpoint/programa/listall").catch(() => programaApiFetch<unknown>("/api/programa/listall").catch(() => [])),
          programaApiFetch<unknown>("/api/dev/endpoint/modalidad").catch(() => programaApiFetch<unknown>("/api/dev/endpoint/modalidad/listall").catch(() => [])),
          programaApiFetch<unknown>("/api/dev/endpoint/jornada/listall").catch(() => programaApiFetch<unknown>("/api/dev/endpoint/jornada").catch(() => [])),
          programaApiFetch<unknown>("/api/dev/endpoint/tipoplazo/listall").catch(() => programaApiFetch<unknown>("/api/dev/endpoint/tipoplazo").catch(() => [])),
          programaApiFetch<unknown>("/api/dev/endpoint/cohorte/listall").catch(() => programaApiFetch<unknown>("/api/dev/endpoint/cohorte").catch(() => [])),
        ]);

        const normalizeLabel = (item: unknown): string => {
          if (item === null || item === undefined) return "";
          if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
          if (typeof item === "object") {
            const obj = item as Record<string, unknown>;
            if (typeof obj.nombre === "string") return obj.nombre;
            const keys = ["valor", "label", "descripcion", "name", "titulo", "texto", "valorJornada", "nombreJornada", "tipo"];
            for (const k of keys) {
              const v = obj[k];
              if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
              if (v && typeof v === "object") {
                const ov = v as Record<string, unknown>;
                if (typeof ov.valor === "string") return ov.valor;
                if (typeof ov.nombre === "string") return ov.nombre;
              }
            }
          }
          return "";
        };

        const toArray = (v: unknown): unknown[] => {
          if (Array.isArray(v)) return v;
          if (!v) return [];
          if (typeof v === "object") {
            const obj = v as Record<string, unknown>;
            if (Array.isArray(obj.data)) return obj.data;
            if (typeof obj.length === "number") {
              const out: unknown[] = [];
              for (let i = 0; i < (obj.length as number); i++) {
                if (Object.prototype.hasOwnProperty.call(obj, String(i))) out.push(obj[String(i)]);
              }
              return out;
            }
          }
          return [];
        };

        const pArr = toArray(pList);
        const mArr = toArray(modList);
        const jArr = toArray(jornadaList);
        const plArr = toArray(plazoList);
        const cohArr = toArray(cohorteList);

        if (!mounted) return;

        setProgramas(pArr.map((x) => {
          const it = x as Record<string, unknown> & { id?: number; _id?: number; nombre?: string };
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setModalidades(mArr.map((x) => {
          const it = x as Record<string, unknown> & { id?: number; _id?: number; nombre?: string };
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setJornadas(jArr.map((x) => {
          const it = x as Record<string, unknown> & { id?: number; _id?: number; nombre?: string };
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setPlazos(plArr.map((x) => {
          const it = x as Record<string, unknown> & { id?: number; _id?: number; nombre?: string };
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setCohortes(cohArr.map((x) => {
          const it = x as Record<string, unknown> & { id?: number; _id?: number; nombre?: string };
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
      } catch (err) {
        console.warn("No se pudieron cargar catálogos:", err);
      }
    }
    loadCatalogs();
    return () => { mounted = false; };
  }, []);

  function validarCampos() {
    if (!form.encuentros) return 'El campo "encuentros" es obligatorio.';
    if (form.cupos === "" || form.cupos === null) return 'El campo "cupos" es obligatorio.';
    if (!form.idPrograma) return 'Selecciona un programa.';
    if (!form.idModalidad) return 'Selecciona una modalidad.';
    if (!form.idJornada) return 'Selecciona una jornada.';
    if (!form.idCohorte) return 'Selecciona una cohorte.';
    if (!form.idPlazo) return 'Selecciona un plazo.';
    if (!form.fechainicio) return 'Selecciona fecha de inicio.';
    if (!form.fechafin) return 'Selecciona fecha de fin.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validarCampos();
    if (v) {
      setError(v);
      return;
    }

    const ofertaId = form.ofertaId ?? initial?.ofertaId;

    const payload = {
      encuentros: form.encuentros.trim(),
      cupos: Number(form.cupos),
      idPrograma: Number(form.idPrograma),
      idModalidad: Number(form.idModalidad),
      idJornada: Number(form.idJornada),
      idCohorte: Number(form.idCohorte),
      plazo: {
        fechainicio: form.fechainicio,
        fechafin: form.fechafin,
        idTipoplazo: Number(form.idPlazo),
      },
    } as Record<string, unknown>;

    // When editing, include the oferta id in the request body (not in the URL)
    if (mode === "edit" && ofertaId) {
      (payload as Record<string, unknown>)["id"] = ofertaId;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await programaApiFetch('/api/application/case/ofertaacademica/createWithPlazo', { method: 'POST', body: JSON.stringify(payload) });
        console.log(payload)
      } else {
        const ofertaId = form.ofertaId ?? initial?.ofertaId;
        if (!ofertaId) throw new Error('ID de oferta no proporcionado para editar.');
        await programaApiFetch(`/api/dev/endpoint/ofertaacademica/update`, { method: 'PUT', body: JSON.stringify(payload) });
      }

      if (onSaved) onSaved();
      else navigate('/programa/cohortes');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${mode === 'create' ? 'Error al crear cohorte:' : 'Error al actualizar cohorte:'} ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{mode === 'create' ? 'Crear cohorte' : 'Editar cohorte'}</h2>
          <button type="button" onClick={() => navigate('/programa/inicio')} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Encuentros</label>
            <input value={form.encuentros} onChange={(e) => setForm(f => ({ ...f, encuentros: e.target.value }))} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Descripción de encuentros (ej: Lunes 6-8pm)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Programa</label>
            <select value={form.idPrograma} onChange={(e) => setForm(f => ({ ...f, idPrograma: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione programa...</option>
              {programas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modalidad</label>
            <select value={form.idModalidad} onChange={(e) => setForm(f => ({ ...f, idModalidad: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione modalidad...</option>
              {modalidades.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jornada</label>
            <select value={form.idJornada} onChange={(e) => setForm(f => ({ ...f, idJornada: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione jornada...</option>
              {jornadas.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cupos</label>
            <input type="number" value={form.cupos} onChange={(e) => setForm(f => ({ ...f, cupos: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Número de cupos" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cohorte</label>
            <select value={form.idCohorte} onChange={(e) => setForm(f => ({ ...f, idCohorte: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione cohorte...</option>
              {cohortes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plazo</label>
            <select value={form.idPlazo} onChange={(e) => setForm(f => ({ ...f, idPlazo: e.target.value === '' ? '' : Number(e.target.value) }))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione plazo...</option>
              {plazos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
            <input type="date" value={form.fechainicio} onChange={(e) => setForm(f => ({ ...f, fechainicio: e.target.value }))} className="mt-1 block w-full rounded border-gray-200 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
            <input type="date" value={form.fechafin} onChange={(e) => setForm(f => ({ ...f, fechafin: e.target.value }))} className="mt-1 block w-full rounded border-gray-200 p-2" />
          </div>

          {error && <p className="text-red-600 md:col-span-2">{error}</p>}

          <div className="md:col-span-2 flex justify-end items-center gap-3 mt-2">
            <button type="button" onClick={() => navigate('/programa/inicio')} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60">{loading ? (mode === 'create' ? 'Guardando...' : 'Guardando...') : (mode === 'create' ? 'Crear cohorte' : 'Guardar cambios')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
