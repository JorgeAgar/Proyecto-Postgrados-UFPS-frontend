import { superadminAuthService } from './superadminService';

const BASE_URL = (import.meta.env.VITE_API_URL as string ?? '').replace(/\/$/, '');

const HTTP_STATUS_TEXT: Record<number, string> = {
	400: 'Solicitud incorrecta',
	401: 'No autorizado',
	403: 'Acceso denegado',
	404: 'Recurso no encontrado',
	409: 'Conflicto con el estado actual',
	422: 'Datos no procesables',
	500: 'Error interno del servidor',
	502: 'Error de puerta de enlace',
	503: 'Servicio no disponible',
};

export interface EstadoOutput {
	id: number;
	entidad: string;
	tipo: string;
}

export interface SemestreOutput {
	id: number;
	nombre: string;
	fechainicio: string;
	fechafin: string;
	idEstado: number;
	estado?: string | EstadoOutput | null;
}

export interface SemestreFormPayload {
	id?: number;
	nombre: string;
	fechaInicio: string;
	fechaFin: string;
	idEstado: number;
}

let semestresCache: SemestreOutput[] | null = null;
let semestresPromise: Promise<SemestreOutput[]> | null = null;
let estadosCache: EstadoOutput[] | null = null;
let estadosPromise: Promise<EstadoOutput[]> | null = null;

function extractErrorMessage(body: unknown, status: number, statusText: string): string {
	if (typeof body === 'string') {
		const trimmed = body.trim();
		if (trimmed && !trimmed.startsWith('<')) return trimmed;
	}
	if (body && typeof body === 'object') {
		const obj = body as Record<string, unknown>;
		if (typeof obj.message === 'string' && obj.message) return obj.message;
		if (typeof obj.mensaje === 'string' && obj.mensaje) return obj.mensaje;
		const skip = new Set(['timestamp', 'path', 'trace', 'error', 'status']);
		for (const [key, val] of Object.entries(obj)) {
			if (!skip.has(key) && typeof val === 'string' && val) return val;
		}
	}
	const desc = statusText || HTTP_STATUS_TEXT[status];
	return desc ? `Error ${status}: ${desc}` : `Error ${status}`;
}

function normalizeEstado(estado: unknown): EstadoOutput | string | null | undefined {
	if (!estado || typeof estado !== 'object') return estado as string | null | undefined;
	const raw = estado as Partial<EstadoOutput> & Record<string, unknown>;
	return {
		id: Number(raw.id ?? 0),
		entidad: String(raw.entidad ?? ''),
		tipo: String(raw.tipo ?? ''),
	};
}

function normalizeSemestre(raw: unknown, fallback?: Partial<SemestreFormPayload> & { id?: number }): SemestreOutput {
	const data = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
	return {
		id: Number(data.id ?? fallback?.id ?? 0),
		nombre: String(data.nombre ?? fallback?.nombre ?? ''),
		fechainicio: String(data.fechainicio ?? data.fechaInicio ?? fallback?.fechaInicio ?? ''),
		fechafin: String(data.fechafin ?? data.fechaFin ?? fallback?.fechaFin ?? ''),
		idEstado: Number(data.idEstado ?? fallback?.idEstado ?? 0),
		estado: normalizeEstado(data.estado),
	};
}

function normalizeSemestres(raw: unknown): SemestreOutput[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => normalizeSemestre(item));
}

function normalizeEstados(raw: unknown): EstadoOutput[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => {
		const data = (item && typeof item === 'object') ? item as Record<string, unknown> : {};
		return {
			id: Number(data.id ?? 0),
			entidad: String(data.entidad ?? ''),
			tipo: String(data.tipo ?? ''),
		};
	}).filter((estado) => estado.entidad.toLowerCase() === 'semestre');
}

function findEstadoById(idEstado: number): EstadoOutput | undefined {
	return estadosCache?.find((estado) => estado.id === idEstado);
}

function enrichSemestre(semestre: SemestreOutput): SemestreOutput {
	const estado = typeof semestre.estado === 'object' && semestre.estado !== null
		? semestre.estado
		: findEstadoById(semestre.idEstado);
	return estado ? { ...semestre, estado } : semestre;
}

function reconcileSemestresEstados(next: SemestreOutput[]): SemestreOutput[] {
	return next.map((semestre) => enrichSemestre(semestre));
}

async function request<T>(path: string, options?: RequestInit, retry = false): Promise<T> {
	const token = superadminAuthService.getAccessToken();
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options?.headers,
	};

	const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

	if (res.status === 403 && !retry) {
		const refreshed = await superadminAuthService.refreshSession();
		if (refreshed) {
			return request<T>(path, options, true);
		}
		superadminAuthService.logout();
		throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
	}

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		let body: unknown;
		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}
		throw new Error(extractErrorMessage(body, res.status, res.statusText));
	}

	if (res.status === 204) return undefined as T;
	if (res.headers.get('content-length') === '0') return undefined as T;

	const text = await res.text();
	if (!text) return undefined as T;

	try {
		return JSON.parse(text) as T;
	} catch {
		return undefined as T;
	}
}

function syncSemestreCache(next: SemestreOutput[]): SemestreOutput[] {
	const normalized = reconcileSemestresEstados(next);
	semestresCache = normalized;
	return [...normalized];
}

function syncEstadoCache(next: EstadoOutput[]): EstadoOutput[] {
	estadosCache = next;
	return [...next];
}

export const superadminSemestresService = {
	async listar(forceRefresh = false): Promise<SemestreOutput[]> {
		if (!forceRefresh && semestresCache) {
			return [...semestresCache];
		}
		if (!semestresPromise || forceRefresh) {
			semestresPromise = request<SemestreOutput[]>('/api/dev/endpoint/semestre/listall', { method: 'GET' })
				.then((data) => syncSemestreCache(normalizeSemestres(data)))
				.finally(() => {
					semestresPromise = null;
				});
		}
		return semestresPromise;
	},

	async listarEstados(forceRefresh = false): Promise<EstadoOutput[]> {
		if (!forceRefresh && estadosCache) {
			return [...estadosCache];
		}
		if (!estadosPromise || forceRefresh) {
			estadosPromise = request<EstadoOutput[]>('/api/dev/endpoint/estado/listall', { method: 'GET' })
				.then((data) => {
					const nextEstados = syncEstadoCache(normalizeEstados(data));
					if (semestresCache) {
						semestresCache = reconcileSemestresEstados(semestresCache);
					}
					return nextEstados;
				})
				.finally(() => {
					estadosPromise = null;
				});
		}
		return estadosPromise;
	},

	async crear(data: SemestreFormPayload): Promise<SemestreOutput[]> {
		const created = normalizeSemestre(await request<unknown>('/api/dev/endpoint/semestre/create', {
			method: 'POST',
			body: JSON.stringify(data),
		}), data);

		const next = [...(semestresCache ?? []), created];
		return syncSemestreCache(next);
	},

	async actualizar(data: SemestreFormPayload & { id: number }): Promise<SemestreOutput[]> {
		const updated = normalizeSemestre(await request<unknown>('/api/dev/endpoint/semestre/update', {
			method: 'PUT',
			body: JSON.stringify(data),
		}), data);

		const current = semestresCache ?? [];
		const next = current.some((item) => item.id === updated.id)
			? current.map((item) => (item.id === updated.id ? updated : item))
			: [...current, updated];
		return syncSemestreCache(next);
	},

	async eliminar(id: number): Promise<SemestreOutput[]> {
		await request<unknown>('/api/dev/endpoint/semestre/delete', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
		});

		const next = (semestresCache ?? []).filter((item) => item.id !== id);
		return syncSemestreCache(next);
	},

	getCachedSemestres(): SemestreOutput[] {
		return [...(semestresCache ?? [])];
	},

	getCachedEstados(): EstadoOutput[] {
		return [...(estadosCache ?? [])];
	},
};
