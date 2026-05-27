import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import programaDocsService, { type RequiredDoc } from '../../../services/programa/programaDocsService';

type ToastTone = 'success' | 'error' | 'warning';

export default function ProgramaDocumentos() {
  const [docsPrograma, setDocsPrograma] = useState<RequiredDoc[]>([]);
  const [docsConsejo, setDocsConsejo] = useState<RequiredDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | number | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | number | null>(null);
  const [draftDoc, setDraftDoc] = useState<RequiredDoc | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);

  const sessionProgramaId = useMemo(() => {
    const sessionRaw = localStorage.getItem('ufps_programa_session');
    const session = sessionRaw ? JSON.parse(sessionRaw) : {};
    return String(session.programaId ?? session.userId ?? 'me');
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const payload = await programaDocsService.fetchRequiredDocuments();
        setDocsPrograma(payload.documentosPrograma ?? []);
        setDocsConsejo(payload.documentosConsejo ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionProgramaId]);

  const showToast = (tone: ToastTone, message: string) => {
    setToast({ tone, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const Spinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  const clearEditor = () => {
    setEditingDocId(null);
    setDraftDoc(null);
    setSelectedFile(null);
  };

  const addEmpty = () => {
    const localId = `local-${Date.now()}`;
    const newDoc: RequiredDoc = { id: localId, nombre: '', formato: null };
    setDocsPrograma((prev) => [newDoc, ...prev]);
    setEditingDocId(localId);
    setDraftDoc(newDoc);
    setSelectedFile(null);
  };

  const startEdit = (doc: RequiredDoc) => {
    setEditingDocId(doc.id);
    setDraftDoc({ ...doc });
    setSelectedFile(null);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) return;
    setDraftDoc((prev) => (prev ? { ...prev, formato: file.name } : prev));
  };

  const cancelEdit = () => {
    if (draftDoc?.id.toString().startsWith('local-')) {
      setDocsPrograma((prev) => prev.filter((doc) => String(doc.id) !== String(draftDoc.id)));
    }
    clearEditor();
  };

  const saveDraft = async () => {
    if (!draftDoc) return;

    const nombre = draftDoc.nombre.trim();
    if (!nombre) {
      showToast('error', 'El nombre del documento es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (String(draftDoc.id).startsWith('local-')) {
        await programaDocsService.createRequiredDocument(nombre, selectedFile ?? null);
      } else {
        await programaDocsService.updateRequiredDocument(String(draftDoc.id), { nombre }, selectedFile ?? null);
      }

      const refreshed = await programaDocsService.fetchRequiredDocuments();
      setDocsPrograma(refreshed.documentosPrograma ?? []);
      setDocsConsejo(refreshed.documentosConsejo ?? []);
      clearEditor();
      showToast('success', String(draftDoc.id).startsWith('local-') ? 'Documento creado.' : 'Documento actualizado.');
    } catch {
      showToast('error', 'No se pudo guardar el documento.');
    } finally {
      setSaving(false);
    }
  };

  const removeDoc = async (doc: RequiredDoc) => {
    if (String(doc.id).startsWith('local-')) {
      setDocsPrograma((prev) => prev.filter((item) => String(item.id) !== String(doc.id)));
      if (editingDocId === doc.id) {
        clearEditor();
      }
      showToast('warning', 'Borrador eliminado.');
      return;
    }

    setDeletingDocId(doc.id);
    try {
      await programaDocsService.deleteRequiredDocument(String(doc.id));
      const refreshed = await programaDocsService.fetchRequiredDocuments();
      setDocsPrograma(refreshed.documentosPrograma ?? []);
      setDocsConsejo(refreshed.documentosConsejo ?? []);
      if (editingDocId === doc.id) {
        clearEditor();
      }
      showToast('success', 'Documento eliminado.');
    } catch {
      showToast('error', 'No se pudo eliminar el documento.');
    } finally {
      setDeletingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-100 p-8">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3 text-gray-700">
            <Spinner className="h-5 w-5 text-red-700" />
            <div>
              <p className="text-sm font-semibold">Cargando documentos</p>
              <p className="text-sm text-gray-500">Preparando la vista de tarjetas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Documentos Requeridos</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addEmpty}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
            >
              + Agregar documento
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Documentos del Programa</h1>
              <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">{docsPrograma.length}</span>
            </div>

            <div className="space-y-4">
              {docsPrograma.map((doc) => (
                <div
                  key={doc.id}
                  className={`rounded-lg border bg-white p-4 transition hover:border-gray-300 ${editingDocId === doc.id ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'} ${saving && editingDocId === doc.id ? 'opacity-90' : ''}`}
                >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  {editingDocId === doc.id && draftDoc ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del documento</label>
                        <input
                          value={draftDoc.nombre}
                          onChange={(e) => setDraftDoc({ ...draftDoc, nombre: e.target.value })}
                          placeholder="Nombre del documento"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-200 focus:ring-2 focus:ring-red-100"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                        <input
                          id={`file-${doc.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor={`file-${doc.id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4" />
                          Añadir formato
                        </label>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">Formato opcional.</span>{' '}
                          {selectedFile ? selectedFile.name : draftDoc.formato ? `Archivo actual: ${draftDoc.formato}` : 'Si no se carga, el documento se guarda sin formato.'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`rounded-full px-2.5 py-1 ${selectedFile ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {selectedFile ? 'Formato seleccionado' : 'Sin formato nuevo'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-900">{doc.nombre}</h2>
                      </div>
                      {doc.formato ? (
                        <div className="mt-2 text-sm text-gray-500">
                          Formato: <span className="font-medium text-gray-700">{doc.formato}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {editingDocId === doc.id && draftDoc ? (
                    <>
                      <button
                        onClick={saveDraft}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
                      >
                        {saving ? <Spinner className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {doc.urlformato ? (
                        <a
                          href={doc.urlformato}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                          Descargar
                        </a>
                      ) : null}
                      <button
                        onClick={() => startEdit(doc)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => removeDoc(doc)}
                        disabled={deletingDocId === doc.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100"
                      >
                        {deletingDocId === doc.id ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                        {deletingDocId === doc.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {!editingDocId && deletingDocId === doc.id ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-100 px-3 py-2 text-sm text-amber-700">
                  <Spinner className="h-4 w-4" />
                  Procesando eliminación...
                </div>
              ) : null}
            </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Documentos del Consejo</h2>
              <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">{docsConsejo.length}</span>
            </div>

            <div className="space-y-4">
              {docsConsejo.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
                      <DocumentTextIcon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{doc.nombre}</h3>
                      </div>
                      {doc.formato ? (
                        <div className="mt-2 text-sm text-gray-500">Formato: <span className="font-medium text-gray-700">{doc.formato}</span></div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {doc.urlformato ? (
                        <a href={doc.urlformato} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Descargar
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div className="fixed right-6 top-6 z-50 w-[min(24rem,calc(100vw-3rem))]">
          <div
            className={`flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${
              toast.tone === 'success'
                ? 'border-green-200 bg-green-100 text-green-700'
                : toast.tone === 'warning'
                  ? 'border-amber-200 bg-amber-100 text-amber-700'
                  : 'border-red-200 bg-red-100 text-red-700'
            }`}
          >
            <div className={`mt-0.5 rounded-full p-1 ${toast.tone === 'success' ? 'bg-green-700 text-white' : toast.tone === 'warning' ? 'bg-amber-400 text-white' : 'bg-red-700 text-white'}`}>
              {toast.tone === 'error' ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.tone === 'success' ? 'Confirmación' : toast.tone === 'warning' ? 'Aviso' : 'Error'}</p>
              <p className="text-sm text-current/90">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg p-1 transition hover:bg-black/5"
              aria-label="Cerrar notificación"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
