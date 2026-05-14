/* aspiranteDocumentosService.ts
   Servicio para gestionar documentos del aspirante.
   - Endpoints son placeholders (fake) que deberás reemplazar con el backend real.
   - Las funciones usan fetch y devuelven mocks si la petición falla.
*/

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://api.example.com/aspirante';

export type DocumentStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  fileName?: string;
  rejectionReason?: string | null;
}

// Mock dataset (desarrollo)
const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: '1', name: 'Acta de nacimiento', status: 'pending' },
  { id: '2', name: 'Certificado de licenciatura', status: 'pending' },
  { id: '3', name: 'Carta de exposición de motivos', status: 'pending' },
  { id: '4', name: 'Curriculum vitae actualizado', status: 'pending' },
  { id: '5', name: 'Comprobante de pago', status: 'pending' },
];

// Helper: intenta fetch y devuelve fallback en error
async function tryFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // si no hay body esperado, devolver fallback
    const text = await res.text();
    if (!text) return (fallback as T);
    return JSON.parse(text) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[aspiranteDocumentosService] request failed, returning mock', url, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

/** Obtiene lista de documentos requeridos para el aspirante */
export async function fetchRequiredDocuments(aspiranteId: string): Promise<DocumentItem[]> {
  const url = `${API_BASE}/${aspiranteId}/documentos`;
  return tryFetch<DocumentItem[]>(url, undefined, MOCK_DOCUMENTS);
}

/** Subir/reemplazar un documento */
export async function uploadDocument(aspiranteId: string, documentId: string, file: File): Promise<DocumentItem> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}`;
  const form = new FormData();
  form.append('file', file);
  const fallback: DocumentItem = { id: documentId, name: `Documento ${documentId}`, status: 'reviewing', fileName: file.name };
  return tryFetch<DocumentItem>(url, { method: 'POST', body: form }, fallback);
}

/** Enviar todos los documentos para revisión */
export async function submitDocumentsForReview(aspiranteId: string): Promise<{ success: boolean }> {
  const url = `${API_BASE}/${aspiranteId}/documentos/enviar`;
  const fallback = { success: true };
  return tryFetch<{ success: boolean }>(url, { method: 'POST' }, fallback);
}

/** Obtener un documento específico (meta) */
export async function getDocument(aspiranteId: string, documentId: string): Promise<DocumentItem> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}`;
  const fallback = MOCK_DOCUMENTS.find(d => d.id === documentId) || { id: documentId, name: `Documento ${documentId}`, status: 'pending' };
  return tryFetch<DocumentItem>(url, undefined, fallback);
}

/** Descargar archivo (devuelve url firme o base64 en caso de fallback) */
export async function downloadDocumentFile(aspiranteId: string, documentId: string): Promise<{ url?: string; blobBase64?: string | null }> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}/download`;
  const fallback = { url: undefined, blobBase64: null };
  return tryFetch<{ url?: string; blobBase64?: string | null }>(url, undefined, fallback);
}

export default {
  fetchRequiredDocuments,
  uploadDocument,
  submitDocumentsForReview,
  getDocument,
  downloadDocumentFile,
};

/*
  Documentación breve de lo que el backend debe exponer para soportar la UI:

  1) GET /aspirante/:aspiranteId/documentos
     - Respuesta: [{ id, name, status: 'pending'|'reviewing'|'approved'|'rejected', fileName?, rejectionReason? }]
     - Notas: status indica la visualización y el badge; fileName muestra el nombre subido.

  2) POST /aspirante/:aspiranteId/documentos/:documentId
     - Body: multipart/form-data con campo `file`
     - Respuesta: el documento actualizado { id, name, status, fileName, rejectionReason? }
     - Notas: si la subida es exitosa, backend puede cambiar estado a `reviewing`.

  3) POST /aspirante/:aspiranteId/documentos/enviar
     - Informa al backend que el aspirante solicita revisión de todos los documentos.
     - Respuesta: { success: boolean }

  4) GET /aspirante/:aspiranteId/documentos/:documentId
     - Respuesta: metadata del documento (igual al item individual)

  5) GET /aspirante/:aspiranteId/documentos/:documentId/download
     - Devuelve signed URL o stream del archivo (Content-Type apropiado)
     - Respuesta: { url: '<signed-url>' } o el archivo directamente

  Seguridad:
  - Todas las rutas deben validar que el token pertenece al `aspiranteId` solicitado.
  - Recomendado usar `Authorization: Bearer <token>`.

  Campos recomendados:
  - `status` (string) y `statusCode` si se quiere lógica extra
  - `fileName` y `fileUrl` (signed)
  - `rejectionReason` cuando status == 'rejected'
*/