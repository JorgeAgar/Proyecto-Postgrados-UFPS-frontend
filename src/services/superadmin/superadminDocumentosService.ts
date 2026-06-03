import { superadminApiFetch, superadminApiUploadFile } from './superadminService';

export interface DocumentoConsejoOutput {
	id: number;
	nombre: string;
	tamanomaximo: number;
	urlformato?: string | null;
}

export interface DocumentoConsejoPayload {
	id?: number;
	nombre: string;
	tamanomaximo: number;
}

let documentosCache: DocumentoConsejoOutput[] = [];
let documentosLoaded = false;
let documentosPromise: Promise<DocumentoConsejoOutput[]> | null = null;

function normalizeDocumento(raw: unknown, fallback?: Partial<DocumentoConsejoPayload> & { id?: number; urlformato?: string | null }): DocumentoConsejoOutput {
	const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
	const urlformato = data.urlformato ?? data.urlFormato ?? fallback?.urlformato ?? null;
	return {
		id: Number(data.id ?? fallback?.id ?? 0),
		nombre: String(data.nombre ?? fallback?.nombre ?? ''),
		tamanomaximo: Number(data.tamanomaximo ?? data.tamanoMaximo ?? fallback?.tamanomaximo ?? 0),
		urlformato: typeof urlformato === 'string' && urlformato.trim() ? urlformato : null,
	};
}

function normalizeDocumentos(raw: unknown): DocumentoConsejoOutput[] {
	if (Array.isArray(raw)) {
		return raw.map((item) => normalizeDocumento(item));
	}

	if (raw && typeof raw === 'object') {
		const data = raw as Record<string, unknown>;
		if (Array.isArray(data.data)) {
			return data.data.map((item) => normalizeDocumento(item));
		}
		if (Array.isArray(data.documentos)) {
			return data.documentos.map((item) => normalizeDocumento(item));
		}
		if ('id' in data || 'nombre' in data || 'tamanomaximo' in data || 'tamanoMaximo' in data) {
			return [normalizeDocumento(data)];
		}
	}

	return [];
}

function getPayloadItems(raw: unknown): { items: DocumentoConsejoOutput[]; isCollection: boolean } {
	if (Array.isArray(raw)) {
		return {
			items: raw.map((item) => normalizeDocumento(item)),
			isCollection: true,
		};
	}

	const items = normalizeDocumentos(raw);
	return {
		items,
		isCollection: items.length > 1,
	};
}

function getCachedDocumentos(): DocumentoConsejoOutput[] {
	return [...documentosCache];
}

function syncCache(next: DocumentoConsejoOutput[]): DocumentoConsejoOutput[] {
	documentosCache = [...next];
	documentosLoaded = true;
	return getCachedDocumentos();
}

function upsertCache(item: DocumentoConsejoOutput): DocumentoConsejoOutput[] {
	const next = documentosCache.some((current) => current.id === item.id)
		? documentosCache.map((current) => (current.id === item.id ? item : current))
		: [...documentosCache, item];
	return syncCache(next);
}

function removeCache(id: number): DocumentoConsejoOutput[] {
	return syncCache(documentosCache.filter((item) => item.id !== id));
}

function normalizeDeleteId(raw: unknown): number | null {
	if (!raw || typeof raw !== 'object') return null;
	const data = raw as Record<string, unknown>;
	const id = Number(data.id ?? 0);
	return Number.isFinite(id) && id > 0 ? id : null;
}

function mergeWithCachedDocumento(item: DocumentoConsejoOutput): DocumentoConsejoOutput {
	const cached = documentosCache.find((current) => current.id === item.id);
	if (!cached) return item;
	return {
		...cached,
		...item,
		urlformato: item.urlformato ?? cached.urlformato ?? null,
	};
}

function mergeDocumentosWithCache(items: DocumentoConsejoOutput[]): DocumentoConsejoOutput[] {
	return items.map((item) => mergeWithCachedDocumento(item));
}

export const superadminDocumentosService = {
	async listar(forceRefresh = false): Promise<DocumentoConsejoOutput[]> {
		if (!forceRefresh && documentosLoaded) {
			return getCachedDocumentos();
		}

		if (!documentosPromise || forceRefresh) {
			documentosPromise = superadminApiFetch<unknown>('/api/dev/endpoint/documentosrequisitoconsejo/listall', {
				method: 'GET',
			})
				.then((data) => syncCache(mergeDocumentosWithCache(normalizeDocumentos(data))))
				.finally(() => {
					documentosPromise = null;
				});
		}

		return documentosPromise;
	},

	async crear(data: DocumentoConsejoPayload, file?: File | null): Promise<DocumentoConsejoOutput[]> {
		const form = new FormData();
		form.append('body', new Blob([JSON.stringify({ nombre: data.nombre.trim(), tamanomaximo: data.tamanomaximo })], { type: 'application/json' }));
		if (file) form.append('file', file);

		const created = await superadminApiUploadFile<unknown>('/api/dev/endpoint/documentosrequisitoconsejo/create', form, false, 'POST');

		const payload = getPayloadItems(created);
		if (payload.isCollection) {
			return syncCache(payload.items);
		}

		return upsertCache(payload.items[0] ?? normalizeDocumento(created, data));
	},

	async actualizar(data: DocumentoConsejoPayload & { id: number; urlformato?: string | null }, file?: File | null): Promise<DocumentoConsejoOutput[]> {
		let updated: unknown;
		const cachedUrlformato = data.urlformato ?? documentosCache.find((current) => current.id === data.id)?.urlformato ?? null;

		if (file) {
			const form = new FormData();
			form.append('body', new Blob([JSON.stringify({ id: data.id, nombre: data.nombre.trim(), tamanomaximo: data.tamanomaximo })], { type: 'application/json' }));
			form.append('file', file);
			updated = await superadminApiUploadFile<unknown>(`/api/dev/endpoint/documentosrequisitoconsejo/superadmin/${data.id}`, form, false, 'PUT');
		} else {
			updated = await superadminApiFetch<unknown>('/api/dev/endpoint/documentosrequisitoconsejo/update', {
				method: 'PUT',
				body: JSON.stringify({
					id: data.id,
					nombre: data.nombre.trim(),
					tamanomaximo: data.tamanomaximo,
					urlformato: cachedUrlformato,
				}),
			});
		}

		const payload = getPayloadItems(updated);
		if (payload.isCollection) {
			return syncCache(payload.items.map(mergeWithCachedDocumento));
		}

		const normalized = payload.items[0] ?? normalizeDocumento(updated, data);
		return upsertCache(mergeWithCachedDocumento(normalized));
	},

	async eliminar(id: number): Promise<DocumentoConsejoOutput[]> {
		const deleted = await superadminApiFetch<unknown>('/api/dev/endpoint/documentosrequisitoconsejo/delete', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
		});

		const next = normalizeDocumentos(deleted);
		if (next.length > 0) {
			return syncCache(next);
		}

		return removeCache(normalizeDeleteId(deleted) ?? id);
	},

	getCachedDocumentos(): DocumentoConsejoOutput[] {
		return getCachedDocumentos();
	},

	hasCachedDocumentos(): boolean {
		return documentosLoaded;
	},
};
