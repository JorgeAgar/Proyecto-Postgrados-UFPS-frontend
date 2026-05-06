import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { programaApiFetch } from "../../services/programaService";

interface CrearCohorteProps {
  onClose?: () => void;
}

type Option = { id: number; nombre?: string };
type CatalogItem = Record<string, unknown> & { id?: number; _id?: number; nombre?: string; tipo?: string };

export default function CrearCohorte({ onClose }: CrearCohorteProps) {
  const navigate = useNavigate();

  // -- form fields (required payload) --
  const [encuentros, setEncuentros] = useState("");
  const [idPrograma, setIdPrograma] = useState<number | "">("");
  const [idModalidad, setIdModalidad] = useState<number | "">("");
  const [idJornada, setIdJornada] = useState<number | "">("");
  const [cupos, setCupos] = useState<number | "">("");
  const [idCohorte, setIdCohorte] = useState<number | "">("");
  const [idPlazo, setIdPlazo] = useState<number | "">("");
  const [fechainicio, setFechaInicio] = useState<string>("");
  const [fechafin, setFechaFin] = useState<string>("");
  const [cohortes, setCohortes] = useState<Option[]>([]);

  // catalogs
  const [programas, setProgramas] = useState<Option[]>([]);
  const [modalidades, setModalidades] = useState<Option[]>([]);
  const [jornadas, setJornadas] = useState<Option[]>([]);
  const [plazos, setPlazos] = useState<Option[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [pList, modList, jornadaList, plazoList, cohorteList] = await Promise.all([
          programaApiFetch<unknown>('/api/dev/endpoint/programa/listall').catch(() => programaApiFetch<unknown>('/api/programa/listall').catch(() => [])),
          programaApiFetch<unknown>('/api/dev/endpoint/modalidad').catch(() => programaApiFetch<unknown>('/api/dev/endpoint/modalidad/listall').catch(() => [])),
          // jornada: use the full list endpoint as provided
          programaApiFetch<unknown>('/api/dev/endpoint/jornada/listall').catch(() => programaApiFetch<unknown>('/api/dev/endpoint/jornada').catch(() => [])),
          // plazos
          programaApiFetch<unknown>('/api/dev/endpoint/tipoplazo/listall').catch(() => programaApiFetch<unknown>('/api/dev/endpoint/tipoplazo').catch(() => [])),
          // cohortes
          programaApiFetch<unknown>('/api/dev/endpoint/cohorte/listall').catch(() => programaApiFetch<unknown>('/api/dev/endpoint/cohorte').catch(() => [])),
        ]);

        // debug: print raw jornada response to help validation
        // plain console.log so you can see the raw response in DevTools
        // if the endpoint returns a single object instead of an array, log that explicitly
        if (!Array.isArray(jornadaList)) {
          console.log('jornada raw response (not-array):', jornadaList);
        } else {
          console.log('jornada raw response:', jornadaList);
        }

        // normalize incoming items to a readable string label
        const normalizeLabel = (item: unknown): string => {
          if (item === null || item === undefined) return "";
          if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
          if (typeof item === "object") {
            const obj = item as Record<string, unknown>;
            if (typeof obj.nombre === "string") return obj.nombre;
            if (obj.nombre && typeof obj.nombre === "object") {
              const n = obj.nombre as Record<string, unknown>;
              if (typeof n.valor === "string") return n.valor;
              if (typeof n.nombre === "string") return n.nombre;
            }
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

        // ensure we actually use the underlying array if the response is wrapped or array-like
        const toArray = (v: unknown): unknown[] => {
          if (Array.isArray(v)) return v;
          if (!v) return [];
          if (typeof v === 'object') {
            const obj = v as Record<string, unknown>;
            if (Array.isArray(obj.data)) return obj.data;
            if (typeof obj.length === 'number') {
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

        setProgramas(pArr.map((x) => {
          const it = x as CatalogItem;
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setModalidades(mArr.map((x) => {
          const it = x as CatalogItem;
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setJornadas(jArr.map((x) => {
          const it = x as CatalogItem;
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setPlazos(plArr.map((x) => {
          const it = x as CatalogItem;
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
        setCohortes(cohArr.map((x) => {
          const it = x as CatalogItem;
          return { id: it.id ?? it._id ?? 0, nombre: normalizeLabel(it) };
        }));
      } catch (err) {
        console.warn('No se pudieron cargar catálogos:', err);
      } 
    }
    loadCatalogs();
  }, []);

  function validarCampos() {
    if (!encuentros) return 'El campo "encuentros" es obligatorio.';
    if (cupos === "" || cupos === null) return 'El campo "cupos" es obligatorio.';
    if (!idPrograma) return 'Selecciona un programa.';
    if (!idModalidad) return 'Selecciona una modalidad.';
    if (!idJornada) return 'Selecciona una jornada.';
    if (!idCohorte) return 'Selecciona una cohorte.';
    if (!idPlazo) return 'Selecciona un plazo.';
    if (!fechainicio) return 'Selecciona fecha de inicio.';
    if (!fechafin) return 'Selecciona fecha de fin.';
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

    const payload = {
      encuentros: encuentros.trim(),
      cupos: Number(cupos),
      idPrograma: Number(idPrograma),
      idModalidad: Number(idModalidad),
      idJornada: Number(idJornada),
      idCohorte: Number(idCohorte),
      plazo: {
        fechainicio: fechainicio,
        fechafin: fechafin,
        idTipoplazo: Number(idPlazo),
      },
    } as Record<string, unknown>;

    setLoading(true);
    try {
      // use the explicit backend endpoint for creating oferta académica
      console.log('Payload to submit:', payload);
      await programaApiFetch('/api/dev/endpoint/ofertaacademica/create', { method: 'POST', body: JSON.stringify(payload) });
        // new endpoint that accepts plazo object
        await programaApiFetch('/api/application/case/ofertaacademica/createWithPlazo', { method: 'POST', body: JSON.stringify(payload) });
      (onClose ?? (() => navigate('/programa/cohortes')))();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al crear cohorte: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') (onClose ?? (() => navigate('/programa/inicio')))();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, navigate]);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Crear cohorte</h2>
          <button type="button" onClick={() => (onClose ?? (() => navigate('/programa/inicio')))()} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Encuentros</label>
            <input value={encuentros} onChange={(e) => setEncuentros(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Descripción de encuentros (ej: Lunes 6-8pm)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Programa</label>
            <select value={idPrograma} onChange={(e) => setIdPrograma(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione programa...</option>
              {programas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modalidad</label>
            <select value={idModalidad} onChange={(e) => setIdModalidad(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione modalidad...</option>
              {modalidades.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jornada</label>
            <select value={idJornada} onChange={(e) => setIdJornada(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione jornada...</option>
              {jornadas.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cupos</label>
            <input type="number" value={cupos} onChange={(e) => setCupos(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Número de cupos" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cohorte</label>
            <select value={idCohorte} onChange={(e) => setIdCohorte(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione cohorte...</option>
              {cohortes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plazo</label>
            <select value={idPlazo} onChange={(e) => setIdPlazo(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 p-2">
              <option value="">Seleccione plazo...</option>
              {plazos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
            <input type="date" value={fechainicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
            <input type="date" value={fechafin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" />
          </div>

          {error && <p className="text-red-600 md:col-span-2">{error}</p>}

          <div className="md:col-span-2 flex justify-end items-center gap-3 mt-2">
            <button type="button" onClick={() => (onClose ?? (() => navigate('/programa/inicio')))()} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60">{loading ? 'Guardando...' : 'Crear cohorte'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
