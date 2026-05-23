import { useEffect, useMemo, useState } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  createCriterio,
  deleteCriterio,
  fetchCriteriosCohorteActual,
  saveCriterios,
  updateCriterio,
  type CriterioEvaluacion,
  type CriterioPayload,
} from '../../services/programa/programaCriteriosService';

type ModalMode = 'create' | 'edit';
type NoticeKind = 'success' | 'error' | 'info';

type NoticeState = {
  kind: NoticeKind;
  title: string;
  message: string;
} | null;

type DeletePanelState = {
  title: string;
  message: string;
} | null;

type DeleteConfirmState = {
  criterioId: string;
  criterioNombre: string;
} | null;

const EMPTY_FORM: CriterioPayload = {
  nombre: '',
  descripcion: '',
  peso: 0,
};

export default function Criterios() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [deletePanel, setDeletePanel] = useState<DeletePanelState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null);

  const [cohorteId, setCohorteId] = useState<string>('');
  const [cohorteNombre, setCohorteNombre] = useState<string>('');
  const [criterios, setCriterios] = useState<CriterioEvaluacion[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CriterioPayload>(EMPTY_FORM);
  const [modalError, setModalError] = useState<string | null>(null);

  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ufps_programa_session') || '{}') : {};
  const programaId = session.programaId ?? session.userId ?? 'me';
  const idUsuario = session.userId ?? 'me';

  const pushNotice = (kind: NoticeKind, title: string, message: string) => {
    setNotice({ kind, title, message });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCriteriosCohorteActual(String(idUsuario));
        setCohorteId(data.cohorteActual.id);
        setCohorteNombre(data.cohorteActual.nombre);
        setCriterios(data.criterios);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la configuración de criterios.');
      } finally {
        setLoading(false);
      }
    })();
  }, [idUsuario]);

  const pesoTotal = useMemo(() => criterios.reduce((acc, c) => acc + c.peso, 0), [criterios]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (criterio: CriterioEvaluacion) => {
    setModalMode('edit');
    setEditingId(criterio.id);
    setForm({ nombre: criterio.nombre, descripcion: criterio.descripcion, peso: criterio.peso });
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
      setModalError(null);
      setForm(EMPTY_FORM);
      setEditingId(null);
    }, 170);
  };

  const handleDelete = async (criterioId: string) => {
    const target = criterios.find((c) => c.id === criterioId);
    if (!target) return;
    setDeleteConfirm({ criterioId, criterioNombre: target.nombre });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCriterio(String(idUsuario), cohorteId, deleteConfirm.criterioId);
      setCriterios((prev) => prev.filter((c) => c.id !== deleteConfirm.criterioId));
      setDeletePanel({
        title: 'Criterio eliminado',
        message: `El criterio "${deleteConfirm.criterioNombre}" fue eliminado correctamente.`,
      });
      setNotice(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setDeletePanel({
        title: 'No se pudo eliminar',
        message: 'No se pudo eliminar el criterio. Intenta nuevamente.',
      });
      setDeleteConfirm(null);
    }
  };

  const handleSubmitModal = async () => {
    setModalError(null);

    if (!form.nombre.trim() || !form.descripcion.trim() || form.peso <= 0) {
      setModalError('Completa todos los campos y usa un peso mayor a 0.');
      return;
    }

    let nextList: CriterioEvaluacion[];
    if (modalMode === 'create') {
      nextList = [...criterios, { id: 'tmp', ...form }];
    } else {
      nextList = criterios.map((c) => (c.id === editingId ? { ...c, ...form } : c));
    }

    const total = nextList.reduce((acc, c) => acc + c.peso, 0);
    if (total > 100) {
      setModalError('El total de pesos no puede superar 100%. Ajusta el peso del criterio.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const created = await createCriterio(String(idUsuario), cohorteId, form);
        setCriterios((prev) => [...prev, created]);
        pushNotice('success', 'Criterio agregado', `Se agregó "${created.nombre}" correctamente.`);
      } else if (editingId) {
        const updated = await updateCriterio(String(programaId), cohorteId, editingId, form);
        setCriterios((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        pushNotice('success', 'Criterio actualizado', `Se guardaron los cambios de "${updated.nombre}".`);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError('No se pudo guardar el criterio. Intenta nuevamente.');
      pushNotice('error', 'Error al guardar', 'No se pudo guardar el criterio. Revisa los datos e intenta nuevamente.');
    }
  };

  const handleGuardarConfiguracion = async () => {
    if (pesoTotal !== 100) {
      alert('Para guardar, el total de pesos debe ser exactamente 100%.');
      return;
    }

    try {
      setSaving(true);
      await saveCriterios(String(idUsuario), cohorteId, criterios);
      pushNotice('success', 'Configuración guardada', 'Los criterios se guardaron correctamente.');
    } catch (err) {
      console.error(err);
      pushNotice('error', 'No se pudo guardar', 'No se pudieron guardar los criterios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto bg-white rounded-lg border border-gray-200 p-6 text-neutral-400">Cargando criterios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto bg-red-100 border border-red-200 rounded-lg p-6 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {deletePanel && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1 bg-red-700" />
            <div className="px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-700">
                <TrashIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{deletePanel.title}</div>
                <div className="mt-1 text-sm text-gray-600">{deletePanel.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setDeletePanel(null)}
                className="rounded-full p-1 transition hover:bg-black/5 text-gray-500"
                aria-label="Cerrar panel de eliminación"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1 bg-red-700" />
            <div className="px-4 py-4 flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-700">
                <TrashIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Confirmar eliminación</div>
                <div className="mt-1 text-sm text-gray-600">
                  ¿Estás seguro de eliminar el criterio <span className="font-semibold text-gray-900">"{deleteConfirm.criterioNombre}"</span>?
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full p-1 transition hover:bg-black/5 text-gray-500"
                aria-label="Cerrar confirmación"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-neutral-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-4 shadow-sm backdrop-blur-sm ${
              notice.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : notice.kind === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-sky-200 bg-sky-50 text-sky-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-2 ${notice.kind === 'success' ? 'bg-emerald-100' : notice.kind === 'error' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                {notice.kind === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : notice.kind === 'error' ? (
                  <BellAlertIcon className="h-5 w-5" />
                ) : (
                  <InformationCircleIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{notice.title}</div>
                <div className="mt-1 text-sm opacity-90">{notice.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="rounded-full p-1 transition hover:bg-black/5"
                aria-label="Cerrar notificación"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Criterios de evaluación</h1>
            <p className="text-sm text-neutral-400 mt-1">Cohorte actual: {cohorteNombre || 'Sin cohorte activa'}</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo criterio
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Peso total de criterios</div>
              <div className={`text-2xl font-bold ${pesoTotal === 100 ? 'text-green-700' : 'text-amber-400'}`}>{pesoTotal}%</div>
            </div>
            {pesoTotal !== 100 && (
              <div className="text-xs text-amber-400 bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                El total debe sumar 100% para guardar.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-fade-in-up delay-200">
          <table className="w-full">
            <thead className="bg-neutral-200 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Descripción</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-400">Peso (%)</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {criterios.map((criterio) => (
                <tr key={criterio.id} className="hover:bg-neutral-200 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{criterio.nombre}</td>
                  <td className="px-6 py-4 text-sm text-neutral-400">{criterio.descripcion}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-red-700">{criterio.peso}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(criterio)}
                        className="p-2 text-neutral-400 hover:text-red-700 hover:bg-neutral-200 rounded-lg transition-colors"
                        title="Editar criterio"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(criterio.id)}
                        className="p-2 text-neutral-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar criterio"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-200 border-t-2 border-gray-200">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-base font-bold ${pesoTotal === 100 ? 'text-green-700' : 'text-amber-400'}`}>{pesoTotal}%</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex justify-end animate-fade-in-up delay-300">
          <button
            onClick={handleGuardarConfiguracion}
            disabled={pesoTotal !== 100 || saving}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              pesoTotal === 100 && !saving ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar criterios'}
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className={`fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4 ${modalClosing ? 'animate-overlay-out' : 'animate-overlay-in'}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full ${modalClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{modalMode === 'create' ? 'Nuevo criterio' : 'Editar criterio'}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {modalError && <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{modalError}</div>}

              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-400 mb-2 block">Nombre del criterio</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Experiencia profesional"
                  className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-400 mb-2 block">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe qué se evalúa en este criterio..."
                  rows={3}
                  className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 resize-none"
                />
              </div>

              <div className="mb-1">
                <label className="text-xs font-semibold text-neutral-400 mb-2 block">Peso (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.peso || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, peso: Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitModal}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
              >
                {modalMode === 'create' ? 'Agregar criterio' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
