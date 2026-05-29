import { superadminApiFetch } from './superadminService';

export interface ValorGlobalOutput {
	id: number;
	clave: string;
	valor: string;
}

export interface ValorGlobalPayload {
	id?: number;
	clave: string;
	valor: string;
}

let valoresGlobalesCache: Record<number, ValorGlobalOutput> = {};
let valoresGlobalesOrden: number[] = [];
let valoresGlobalesLoaded = false;
let valoresGlobalesPromise: Promise<ValorGlobalOutput[]> | null = null;

function normalizeValorGlobal(raw: unknown, fallback?: Partial<ValorGlobalPayload> & { id?: number }): ValorGlobalOutput {
	const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
	return {
		id: Number(data.id ?? fallback?.id ?? 0),
		clave: String(data.clave ?? fallback?.clave ?? ''),
		valor: String(data.valor ?? fallback?.valor ?? ''),
	};
}

function normalizeValoresGlobales(raw: unknown): ValorGlobalOutput[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => normalizeValorGlobal(item));
}

function getCachedValoresGlobales(): ValorGlobalOutput[] {
	return valoresGlobalesOrden
		.map((id) => valoresGlobalesCache[id])
		.filter((item): item is ValorGlobalOutput => Boolean(item));
}

function syncCache(next: ValorGlobalOutput[]): ValorGlobalOutput[] {
	const cache: Record<number, ValorGlobalOutput> = {};
	const order: number[] = [];

	for (const item of next) {
		cache[item.id] = item;
		order.push(item.id);
	}

	valoresGlobalesCache = cache;
	valoresGlobalesOrden = order;
	valoresGlobalesLoaded = true;

	return getCachedValoresGlobales();
}

function upsertCache(item: ValorGlobalOutput): ValorGlobalOutput[] {
	const exists = Object.prototype.hasOwnProperty.call(valoresGlobalesCache, item.id);
	valoresGlobalesCache = {
		...valoresGlobalesCache,
		[item.id]: item,
	};

	if (!exists) {
		valoresGlobalesOrden = [...valoresGlobalesOrden, item.id];
	}

	valoresGlobalesLoaded = true;
	return getCachedValoresGlobales();
}

export const superadminGlobalesService = {
	async listar(forceRefresh = false): Promise<ValorGlobalOutput[]> {
		if (!forceRefresh && valoresGlobalesLoaded) {
			return getCachedValoresGlobales();
		}

		if (!valoresGlobalesPromise || forceRefresh) {
			valoresGlobalesPromise = superadminApiFetch<ValorGlobalOutput[]>('/api/dev/endpoint/api/v1/valoresglobales', {
				method: 'GET',
			})
				.then((data) => syncCache(normalizeValoresGlobales(data)))
				.finally(() => {
					valoresGlobalesPromise = null;
				});
		}

		return valoresGlobalesPromise;
	},

	async actualizar(data: ValorGlobalPayload & { id: number }): Promise<ValorGlobalOutput> {
		const updated = normalizeValorGlobal(
			await superadminApiFetch<unknown>(`/api/dev/endpoint/api/v1/valoresglobales/${data.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					id: data.id,
					clave: data.clave,
					valor: data.valor,
				}),
			}),
			data,
		);

		upsertCache(updated);
		return updated;
	},

	getCachedValoresGlobales(): ValorGlobalOutput[] {
		return getCachedValoresGlobales();
	},

	hasCachedValoresGlobales(): boolean {
		return valoresGlobalesLoaded;
	},
};
