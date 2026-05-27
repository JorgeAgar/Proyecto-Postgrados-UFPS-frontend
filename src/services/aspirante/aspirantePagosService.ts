/* Servicio de pagos para aspirante
   - Endpoints son placeholders ("fake") que reemplazarás por los reales
   - Las funciones intentan llamar al endpoint; si falla, devuelven datos mock útiles para desarrollo
   - También exporto interfaces y una sección que documenta qué espera el frontend del backend
*/

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://api.example.com/aspirante';

export type PagoEstado = 'pendiente' | 'pagado';

export interface PaymentSummary {
  id: string;
  title: string;
  description: string;
  valor: number; // en COP
  estado: PagoEstado;
  enabled: boolean;
  icon?: 'document' | 'lock';
  dueDate?: string; // ISO o locale
}

export interface PaymentDetail extends PaymentSummary {
  aspirante: string;
  documento: string;
  programa: string;
  facultad?: string;
  periodo?: string;
  items?: Array<{ label: string; amount: number }>;
  receipt?: PaymentReceipt | null;
  paymentOptions?: {
    methods: string[]; // e.g. ['wompi']
    gatewayPublicKeys?: Record<string, string>;
  };
}

export interface PaymentReceipt {
  id: string;
  number: string;
  date: string; // ISO
  dueDate?: string; // ISO
  amount: number;
  currency: string; // 'COP'
  pdfUrl?: string;
}

export interface InitiatePaymentResponse {
  transactionId: string;
  paymentUrl?: string; // para redirección externa (checkout)
  clientToken?: string; // para pagos embebidos
  amount: number;
  currency: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  transactionId: string;
  paidAt?: string; // ISO
  receiptId?: string;
  status?: string;
}

// Helper: intenta fetch y propaga errores si falla
async function tryFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as T;
  return data;
}

// ------------------ Funciones exportadas ------------------

/** Obtiene el listado de pagos para un aspirante (resumen) */
export async function fetchPayments(aspiranteId: string): Promise<PaymentSummary[]> {
  const url = `${API_BASE}/${aspiranteId}/pagos`;
  return tryFetch<PaymentSummary[]>(url);
}

/** Obtiene detalle de un pago */
export async function fetchPaymentDetail(aspiranteId: string, paymentId: string): Promise<PaymentDetail> {
  const url = `${API_BASE}/${aspiranteId}/pagos/${paymentId}`;
  return tryFetch<PaymentDetail>(url);
}

/** Genera un recibo para un pago (backend debe devolver receipt metadata) */
export async function generateReceipt(aspiranteId: string, paymentId: string): Promise<PaymentReceipt> {
  const url = `${API_BASE}/${aspiranteId}/pagos/${paymentId}/recibo`;
  return tryFetch<PaymentReceipt>(url, { method: 'POST' });
}

/** Inicia el proceso de pago (puede devolver url de checkout o client token para pago embebido) */
export async function initiatePayment(aspiranteId: string, paymentId: string, payload: { method: string; amount?: number }): Promise<InitiatePaymentResponse> {
  const url = `${API_BASE}/${aspiranteId}/pagos/${paymentId}/iniciar`;
  return tryFetch<InitiatePaymentResponse>(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
}

/** Confirma el pago tras callback/webhook o después de proceso en gateway */
export async function confirmPayment(aspiranteId: string, paymentId: string, transactionId: string): Promise<ConfirmPaymentResponse> {
  const url = `${API_BASE}/${aspiranteId}/pagos/${paymentId}/confirmar`;
  return tryFetch<ConfirmPaymentResponse>(url, { method: 'POST', body: JSON.stringify({ transactionId }), headers: { 'Content-Type': 'application/json' } });
}

/** Descarga o devuelve URL del PDF del recibo */
export async function downloadReceipt(aspiranteId: string, receiptId: string): Promise<{ pdfUrl?: string }> {
  const url = `${API_BASE}/${aspiranteId}/recibos/${receiptId}`;
  return tryFetch<{ pdfUrl?: string }>(url);
}

// ------------------ Documentación rápida de lo que el backend debe devolver ------------------
/*
Para integrar completamente la Vista de Pagos se requieren los siguientes endpoints y respuestas:

1) GET /aspirante/:aspiranteId/pagos
   - Respuesta: {
       payments: [ { id, title, description, valor, estado: 'pendiente'|'pagado', enabled, icon?, dueDate? } ]
     }
   - Notas: usar `estado` para decidir color y `enabled` para bloquear interacción.

2) GET /aspirante/:aspiranteId/pagos/:paymentId
   - Respuesta: PaymentDetail {
       id, title, description, valor, estado, enabled,
       aspirante, documento, programa, facultad, periodo,
       items: [{label, amount}],
       receipt: { id, number, date, dueDate, amount, currency, pdfUrl } | null,
       paymentOptions: { methods: ['wompi', ...], gatewayPublicKeys: { wompi: 'pk' } }
     }
   - Notas: `paymentOptions` permite mostrar botones/flows distintos.

3) POST /aspirante/:aspiranteId/pagos/:paymentId/recibo
   - Crea y devuelve metadata del recibo: { id, number, date, dueDate, amount, currency, pdfUrl }

4) POST /aspirante/:aspiranteId/pagos/:paymentId/iniciar
   - Body: { method: 'wompi', ... }
   - Respuesta: { transactionId, paymentUrl?, clientToken?, amount, currency }
   - Notas: para Wompi en checkout redirigir a `paymentUrl`; para integración embebida usar `clientToken`.

5) POST /aspirante/:aspiranteId/pagos/:paymentId/confirmar
   - Body: { transactionId }
   - Respuesta: { success: true|false, transactionId, paidAt, receiptId, status }
   - Notas: además del confirm, el gateway debe enviar webhook al backend para mayor seguridad.

6) GET /aspirante/:aspiranteId/recibos/:receiptId
   - Respuesta: { pdfUrl }

Autenticación / Seguridad:
- Todas las rutas deben requerir `Authorization: Bearer <token>` o sesión válida.
- Proveer `aspiranteId` desde el token o permitir validación de propiedad del recurso.

Campos recomendados en respuestas para facilitar UI:
- Fechas en ISO (ej: 2026-05-13T12:00:00Z) y también `dueDate` explicito.
- `valor` y `currency` separados.
- `status` legible y códigos para lógica (PAID, PENDING, FAILED).
- `gatewayPublicKeys` para inicializar SDKs de pagos en frontend.
- `pdfUrl` accesible temporalmente (signed URL) para descargar recibos.

Códigos de error esperados:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity (validación)
- 500 Server Error
*/

export default {
  fetchPayments,
  fetchPaymentDetail,
  generateReceipt,
  initiatePayment,
  confirmPayment,
  downloadReceipt,
};
