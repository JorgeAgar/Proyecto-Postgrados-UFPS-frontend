import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { createCohorte, updateCohorte } from '../../../services/programa/programaChortesService';

type DocumentoRequerido = {
  nombre: string;
  obligatorio: boolean;
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

function getSessionUserId(): string {
  if (typeof window === 'undefined') return 'me';
  try {
    const raw = localStorage.getItem('ufps_programa_session');
    const session = raw ? JSON.parse(raw) : {};
    return String(session.userId ?? 'me');
  } catch {
    return 'me';
  }
}

const DEFAULT_DOCUMENTO = { nombre: '', obligatorio: false };

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
    documentos: initial?.documentos?.length ? initial.documentos : [{ ...DEFAULT_DOCUMENTO }],
  }));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cohorteId = initial?.cohorteId;

  const totalDocumentos = useMemo(
    () => form.documentos.filter((doc) => doc.nombre.trim()).length,
    [form.documentos],
  );

  function validarCampos() {
    if (!form.nombre.trim()) return 'El campo "nombre" es obligatorio.';
    if (form.cupos === '' || form.cupos === null) return 'El campo "cupos" es obligatorio.';
    if (Number(form.cupos) < 0) return 'El campo "cupos" no puede ser negativo.';
    if (!form.fechaInicio) return 'Selecciona fecha de inicio.';
    if (!form.fechaLimiteDocumentos) return 'Selecciona fecha límite de documentos.';
    if (!form.fechaLimitePago) return 'Selecciona fecha límite de pago.';
    if (form.documentos.some((doc) => doc.nombre.trim() === '')) return 'Todos los documentos deben tener nombre.';
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

    const payload = {
      nombre: form.nombre.trim(),
      cupos: Number(form.cupos),
      fechaInicio: form.fechaInicio,
      fechaLimiteDocumentos: form.fechaLimiteDocumentos,
      fechaLimitePago: form.fechaLimitePago,
      documentos: form.documentos.map((doc) => ({
        nombre: doc.nombre.trim(),
        obligatorio: doc.obligatorio,
      })),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        await createCohorte(getSessionUserId(), payload);
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

  const updateDocumento = (index: number, value: Partial<DocumentoRequerido>) => {
    setForm((prev) => ({
      ...prev,
      documentos: prev.documentos.map((doc, i) => (i === index ? { ...doc, ...value } : doc)),
    }));
  };

  const addDocumento = () => {
    setForm((prev) => ({
      ...prev,
      documentos: [...prev.documentos, { ...DEFAULT_DOCUMENTO }],
    }));
  };

  const removeDocumento = (index: number) => {
    setForm((prev) => ({
      ...prev,
      documentos: prev.documentos.length > 1 ? prev.documentos.filter((_, i) => i !== index) : [{ ...DEFAULT_DOCUMENTO }],
    }));
  };

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
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="block text-sm font-medium text-gray-700">Documentos requeridos</label>
              <button type="button" onClick={addDocumento} className="text-sm text-red-700 hover:text-red-800 font-medium">
                + Agregar documento
              </button>
            </div>

            <div className="space-y-3">
              {form.documentos.map((doc, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center rounded-lg border border-gray-200 p-3">
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) => updateDocumento(index, { nombre: e.target.value })}
                    className="w-full rounded border border-gray-200 p-2"
                    placeholder="Nombre del documento"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 px-2">
                    <input
                      type="checkbox"
                      checked={doc.obligatorio}
                      onChange={(e) => updateDocumento(index, { obligatorio: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Obligatorio
                  </label>
                  <button
                    type="button"
                    onClick={() => removeDocumento(index)}
                    className="text-sm text-gray-500 hover:text-red-700 justify-self-start md:justify-self-end"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Documentos agregados: {totalDocumentos}</p>
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