import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { createCohorte, updateCohorte } from '../../../services/programa/programaChortesService';
import programaDocsService from '../../../services/programa/programaDocsService';

type DocumentoRequerido = {
  idDocrequisito?: string | number;
  id?: string | number;
  nombre: string;
  obligatorio: boolean;
  origen?: 'consejo' | 'programa' | 'manual';
  seleccionado?: boolean;
  __localId?: string;
};

type InitialShape = {
  cohorteId?: string | number;
  nombre?: string;
  cupos?: number;
  fechaInicio?: string;
  fechaLimiteDocumentos?: string;
  fechaLimitePago?: string;
  documentos?: DocumentoRequerido[];
};

type FormState = {
  nombre: string;
  cupos: number | '';
  fechaInicio: string;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
  documentos: DocumentoRequerido[];
};

function toDateInputValue(value?: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return value;
}

function genLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function CohorteForm({
  mode,
  initial,
  onSaved,
}: {
  mode: 'create' | 'edit';
  initial?: InitialShape;
  onSaved?: () => void;
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(() => ({
    nombre: initial?.nombre ?? '',
    cupos: initial?.cupos ?? '',
    fechaInicio: toDateInputValue(initial?.fechaInicio),
    fechaLimiteDocumentos: toDateInputValue(initial?.fechaLimiteDocumentos),
    fechaLimitePago: toDateInputValue(initial?.fechaLimitePago),
    documentos: initial?.documentos?.length
      ? initial!.documentos!.map((d) => ({ ...(d as DocumentoRequerido), __localId: genLocalId() }))
      : [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cohorteId = initial?.cohorteId;

  // totalDocumentos removed: documents now come from program/council endpoints

  const [consejoDocs, setConsejoDocs] = useState<DocumentoRequerido[]>([]);
  const [programaDocs, setProgramaDocs] = useState<DocumentoRequerido[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  function validarCampos() {
    if (!form.nombre.trim()) return 'El campo "nombre" es obligatorio.';
    if (form.cupos === '' || form.cupos === null) return 'El campo "cupos" es obligatorio.';
    if (Number(form.cupos) < 0) return 'El campo "cupos" no puede ser negativo.';
    if (!form.fechaInicio) return 'Selecciona fecha de inicio.';
    if (!form.fechaLimiteDocumentos) return 'Selecciona fecha límite de documentos.';
    if (!form.fechaLimitePago) return 'Selecciona fecha límite de pago.';
    if (consejoDocs.length === 0) return 'No se pudieron cargar los documentos obligatorios del programa.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validarCampos();
    if (validation) {
      setError(validation);
      return;
    }

    const documentosConsejo = consejoDocs.map((d) => ({
      idDocrequisito: d.id ?? d.idDocrequisito,
      nombre: d.nombre,
      ...(cohorteId ? { idCohorte: cohorteId } : {}),
    }));

    const documentosPrograma = programaDocs
      .filter((d) => d.seleccionado)
      .map((d) => ({
        idDocrequisito: d.id ?? d.idDocrequisito,
        nombre: d.nombre,
        ...(cohorteId ? { idCohorte: cohorteId } : {}),
      }));

    const payload = {
      nombre: form.nombre.trim(),
      cupos: Number(form.cupos),
      fechaInicio: form.fechaInicio,
      fechaLimiteDocumentos: form.fechaLimiteDocumentos,
      fechaLimitePago: form.fechaLimitePago,
      documentosConsejo,
      documentosPrograma,
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        await createCohorte(payload);
      } else {
        if (!cohorteId) throw new Error('ID de cohorte no proporcionado para editar.');
        await updateCohorte(String(cohorteId), payload);
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

  // Toggle selection for programa document
  const toggleProgramaDoc = (docId: string | number) => {
    setProgramaDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, seleccionado: !d.seleccionado } : d)));
  };

  useEffect(() => {
    (async () => {
      setDocsLoading(true);
      try {
        const res = await programaDocsService.fetchRequiredDocuments();
        const consejos = (res.documentosConsejo ?? []).map((d) => ({
          id: d.id,
          nombre: d.nombre,
          obligatorio: true,
          origen: 'consejo' as const,
        }));
        const programas = (res.documentosPrograma ?? []).map((d) => ({
          id: d.id,
          nombre: d.nombre,
          obligatorio: false,
          origen: 'programa' as const,
          seleccionado: !!initial?.documentos?.some((idoc) => {
            const item = idoc as Record<string, unknown>;
            const idDoc = item.idDocrequisito ?? item.id;
            return String(idDoc) === String(d.id);
          }),
        }));
        setConsejoDocs(consejos);
        setProgramaDocs(programas);
      } catch (err) {
        console.error('Error cargando documentos requeridos', err);
      } finally {
        setDocsLoading(false);
      }
    })();
  }, [initial?.documentos]);

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{mode === 'create' ? 'Crear cohorte' : 'Editar cohorte'}</h2>
          <button type="button" onClick={() => navigate('/programa/inicio')} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la cohorte</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="mt-1 block w-full rounded border border-gray-200 p-2"
              placeholder="Cohorte-30 2026-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cupos</label>
            <input
              type="number"
              min="0"
              value={form.cupos}
              onChange={(e) => setForm((f) => ({ ...f, cupos: e.target.value === '' ? '' : Number(e.target.value) }))}
              className="mt-1 block w-full rounded border border-gray-200 p-2"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">No se permiten cupos negativos.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
              className="mt-1 block w-full rounded border border-gray-200 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha límite documentos</label>
            <input
              type="date"
              value={form.fechaLimiteDocumentos}
              onChange={(e) => setForm((f) => ({ ...f, fechaLimiteDocumentos: e.target.value }))}
              className="mt-1 block w-full rounded border border-gray-200 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha límite pago</label>
            <input
              type="date"
              value={form.fechaLimitePago}
              onChange={(e) => setForm((f) => ({ ...f, fechaLimitePago: e.target.value }))}
              className="mt-1 block w-full rounded border border-gray-200 p-2"
            />
          </div>

          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Documentos obligatorios (Consejo)</label>
              <div className="mt-2 space-y-2">
                {docsLoading ? (
                  <div className="text-sm text-neutral-400">Cargando documentos...</div>
                ) : (
                  consejoDocs.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                      <span className="text-sm font-medium">{d.nombre}</span>
                      <span className="ml-auto text-xs text-neutral-500">Obligatorio</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Documentos del programa (seleccionables)</label>
              <div className="mt-2 space-y-2">
                {docsLoading ? (
                  <div className="text-sm text-neutral-400">Cargando documentos...</div>
                ) : (
                  programaDocs.map((d) => (
                    <label key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer">
                      <input type="checkbox" checked={!!d.seleccionado} onChange={() => toggleProgramaDoc(d.id!)} className="h-4 w-4" />
                      <span className="text-sm">{d.nombre}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end items-center gap-3 mt-2">
            <button type="button" onClick={() => navigate('/programa/inicio')} className="px-4 py-2 rounded border border-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60">
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear cohorte' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}