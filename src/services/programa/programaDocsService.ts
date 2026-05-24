type RequiredDocPayload = { nombre: string; formato?: string | null };

export type RequiredDoc = {
  id: string | number;
  nombre: string;
  formato?: string | null;
};

// Simple in-memory mock store per programaId
const store: Record<string, RequiredDoc[]> = {
  'me': [
    { id: '1', nombre: 'Cédula de ciudadanía', formato: 'pdf' },
    { id: '2', nombre: 'Hoja de vida', formato: 'pdf' },
  ],
};

function delay<T>(v: T, ms = 200) {
  return new Promise<T>((res) => setTimeout(() => res(v), ms));
}

const programaDocsService = {
  async fetchRequiredDocuments(programaId: string) {
    const list = store[programaId] ?? [];
    return delay(list.map((d) => ({ ...d })));
  },

  async createRequiredDocument(programaId: string, payload: RequiredDocPayload) {
    const id = Date.now().toString();
    const doc: RequiredDoc = { id, nombre: payload.nombre, formato: payload.formato ?? null };
    store[programaId] = [...(store[programaId] ?? []), doc];
    return delay(doc);
  },

  async updateRequiredDocument(docId: string, payload: RequiredDocPayload) {
    for (const k of Object.keys(store)) {
      store[k] = store[k].map((d) => (String(d.id) === String(docId) ? { ...d, nombre: payload.nombre, formato: payload.formato ?? null } : d));
    }
    const found = Object.values(store).flat().find((d) => String(d.id) === String(docId));
    return delay(found ?? null);
  },

  async deleteRequiredDocument(docId: string) {
    for (const k of Object.keys(store)) store[k] = store[k].filter((d) => String(d.id) !== String(docId));
    return delay(true);
  },

  async uploadFormat(docId: string, file: File) {
    // In mock: pretend upload and set formato to file extension
    const ext = file.name.split('.').pop() ?? 'bin';
    await delay(true, 400);
    for (const k of Object.keys(store)) {
      store[k] = store[k].map((d) => (String(d.id) === String(docId) ? { ...d, formato: ext } : d));
    }
    return { success: true };
  },
};

export default programaDocsService;

/* Suggested backend endpoints (example)

GET  /api/application/case/director-programa/programa/:programaId/documentos
  Response: [{ id, nombre, formato }]

POST /api/application/case/director-programa/programa/:programaId/documentos
  Body: { nombre, formato? }
  Response: { id, nombre, formato }

PUT  /api/application/case/director-programa/documentos/:documentoId
  Body: { nombre, formato? }
  Response: { id, nombre, formato }

DELETE /api/application/case/director-programa/documentos/:documentoId
  Response: { success: true }

POST /api/application/case/director-programa/documentos/:documentoId/formato
  multipart/form-data: file
  Response: { success: true, formato: 'pdf' }

*/
