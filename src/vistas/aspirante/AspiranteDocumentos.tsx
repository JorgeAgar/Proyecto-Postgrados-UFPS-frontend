/**
 * AspiranteDocumentos
 *
 * Vista de documentos del aspirante.
 *
 * TODO: conectar con el backend para listar, subir y verificar documentos.
 */

import { useEffect, useState } from 'react';
import { DocumentTextIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import {
  fetchRequiredDocuments,
  uploadDocument,
  submitDocumentsForReview,
} from '../../services/aspirante/aspiranteDocumentosService';
import type { DocumentItem } from '../../services/aspirante/aspiranteDocumentosService';

// Nota: el proyecto usa Tailwind; adaptar clases según la guía de estilos proporcionada.

export default function AspiranteDocumentos() {
  const view: 'antes' | 'despues' = 'antes';
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Record<string, boolean>>({});
  // archivos seleccionados localmente (no subidos aún)
  const [localFiles, setLocalFiles] = useState<Record<string, File>>({});

  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('session') || '{}') : {};
  const aspiranteId = String(session.userId ?? 'me');

  useEffect(() => {
    (async () => {
      const docs = await fetchRequiredDocuments(aspiranteId);
      setDocuments(docs);
    })();
  }, [aspiranteId]);

  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return;
    // guardar localmente y actualizar nombre en UI (estado local)
    setLocalFiles(prev => ({ ...prev, [docId]: file }));
    setDocuments(docs => docs.map(d => (d.id === docId ? { ...d, fileName: file.name } : d)));
  };

  const handleSubmit = async () => {
    // subir sólo los archivos que fueron seleccionados localmente
    const entries = Object.entries(localFiles);
    for (const [docId, file] of entries) {
      setUploadingIds(prev => ({ ...prev, [docId]: true }));
      try {
        const updated = await uploadDocument(aspiranteId, docId, file);
        setDocuments(docs => docs.map(d => (d.id === docId ? updated : d)));
        // eliminar del localFiles si se subió correctamente
        setLocalFiles(prev => {
          const next = { ...prev };
          delete next[docId];
          return next;
        });
      } catch (err) {
        console.error(err);
        alert(`Error subiendo el documento ${docId}`);
      } finally {
        setUploadingIds(prev => ({ ...prev, [docId]: false }));
      }
    }

    // luego notificar al backend que inicie la revisión
    const res = await submitDocumentsForReview(aspiranteId);
    if (res.success) alert('Documentos enviados para revisión');
  };

  const toggleExpand = (docId: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  };

  const allFilesUploaded = documents.length > 0 && documents.every(d => d.fileName);

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block bg-yellow-100 text-yellow-400 border border-amber-200 px-2 py-1 rounded-lg text-xs">Pendiente</span>;
      case 'reviewing':
        return <span className="inline-block bg-amber-100 text-amber-400 border border-amber-200 px-2 py-1 rounded-lg text-xs">En revisión</span>;
      case 'approved':
        return <span className="inline-block bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-lg text-xs">Aprobado</span>;
      case 'rejected':
        return <span className="inline-block bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-lg text-xs">Rechazado</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="bg-red-700 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <p className="text-red-100 text-sm mt-1">Carga y gestiona tus documentos</p>
      </div>

      <main className="max-w-3xl mx-auto p-6">

        {view === 'antes' ? (
          <>
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-2 text-gray-800">{doc.name}</h3>
                      <div className="mb-3">{getStatusBadge(doc.status)}</div>

                      <div className="flex items-center gap-3">
                        <input type="file" id={`file-${doc.id}`} className="hidden" onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
                        <label htmlFor={`file-${doc.id}`}>
                          <button type="button" onClick={() => document.getElementById(`file-${doc.id}`)?.click()} className="px-3 py-2 rounded-lg border border-gray-200 bg-white">{doc.fileName ? 'Cambiar archivo' : 'Subir archivo'}</button>
                        </label>
                        {uploadingIds[doc.id] && <span className="text-sm text-gray-600">Subiendo...</span>}
                        {doc.fileName && <span className="text-sm text-green-700 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" />{doc.fileName}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button disabled={!allFilesUploaded} onClick={handleSubmit} className={`px-4 py-2 rounded-lg ${allFilesUploaded ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-500'}`}>Enviar documentos a revisión</button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              {documents.map(doc => {
                const isExpanded = expandedDocs.has(doc.id);
                const hasLongReason = !!doc.rejectionReason && doc.rejectionReason.length > 80;
                const shouldTruncate = hasLongReason && !isExpanded;

                return (
                  <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg shrink-0"><DocumentTextIcon className="w-5 h-5 text-gray-600" /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-2 text-gray-800">{doc.name}</h3>
                        <div className="mb-3">{getStatusBadge(doc.status)}</div>

                        {doc.status === 'rejected' && doc.rejectionReason && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              <span className="font-medium">Motivo de rechazo:</span> {shouldTruncate ? `${doc.rejectionReason!.substring(0,80)}...` : doc.rejectionReason}
                            </p>
                            {hasLongReason && (
                              <button onClick={() => toggleExpand(doc.id)} className="text-sm text-red-700 hover:underline flex items-center gap-1 mt-2">
                                {isExpanded ? <>Ver menos <ChevronUpIcon className="w-4 h-4" /></> : <>Ver más <ChevronDownIcon className="w-4 h-4" /></>}
                              </button>
                            )}
                          </div>
                        )}

                        {doc.status === 'rejected' && (
                          <div className="flex items-center gap-3">
                            <input type="file" id={`file-replace-${doc.id}`} className="hidden" onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
                            <label htmlFor={`file-replace-${doc.id}`}>
                              <button type="button" onClick={() => document.getElementById(`file-replace-${doc.id}`)?.click()} className="px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-white">Reemplazar documento</button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-red-700 text-white">Reenviar documentos</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
