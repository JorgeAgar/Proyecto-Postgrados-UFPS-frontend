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

// Helper: intenta fetch y propaga errores si falla
async function tryFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error('Empty response body');
  return JSON.parse(text) as T;
}

/** Obtiene lista de documentos requeridos para el aspirante */
export async function fetchRequiredDocuments(aspiranteId: string): Promise<DocumentItem[]> {
  const url = `${API_BASE}/${aspiranteId}/documentos`;
  return tryFetch<DocumentItem[]>(url);
}

/** Subir/reemplazar un documento */
export async function uploadDocument(aspiranteId: string, documentId: string, file: File): Promise<DocumentItem> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}`;
  const form = new FormData();
  form.append('file', file);
  return tryFetch<DocumentItem>(url, { method: 'POST', body: form });
}

/** Enviar todos los documentos para revisión */
export async function submitDocumentsForReview(aspiranteId: string): Promise<{ success: boolean }> {
  const url = `${API_BASE}/${aspiranteId}/documentos/enviar`;
  return tryFetch<{ success: boolean }>(url, { method: 'POST' });
}

/** Obtener un documento específico (meta) */
export async function getDocument(aspiranteId: string, documentId: string): Promise<DocumentItem> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}`;
  return tryFetch<DocumentItem>(url);
}

/** Descargar archivo (devuelve url firme o base64 en caso de fallback) */
export async function downloadDocumentFile(aspiranteId: string, documentId: string): Promise<{ url?: string; blobBase64?: string | null }> {
  const url = `${API_BASE}/${aspiranteId}/documentos/${documentId}/download`;
  return tryFetch<{ url?: string; blobBase64?: string | null }>(url);
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