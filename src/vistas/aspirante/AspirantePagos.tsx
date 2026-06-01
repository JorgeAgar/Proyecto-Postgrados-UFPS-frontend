import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import {
  CreditCardIcon,
  DocumentCurrencyDollarIcon,
  InformationCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  fetchPayments,
  fetchInscripcionResumen,
  fetchInscripcionCheckout,
  fetchMatriculaResumen,
  fetchMatriculaCheckout,
  fetchPaymentDetail,
} from '../../services/aspirante/aspirantePagosService';
import { getAspiranteRealId } from '../../services/aspirante/aspiranteService';
import type {
  InscripcionResumenResponse,
  PaymentDetail,
  PaymentReceipt,
  WompiCheckoutResponse,
} from '../../services/aspirante/aspirantePagosService';
import type { AspiranteOutletContext } from '../../layouts/AspiranteLayout';

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface PaymentItem {
  id: string;
  title: string;
  description: string;
  valor: number;
  estado: 'pendiente' | 'pagado';
  enabled: boolean;
  icon: 'document' | 'lock';
}

// ── Helpers UI ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin shrink-0 ${className ?? 'h-4 w-4 text-red-700'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EstadoPagoBadge({ estado }: { estado: string }) {
  const norm = estado.trim().toUpperCase();
  const styles: Record<string, string> = {
    COMPLETADO: 'bg-green-100 text-green-700 border border-green-200',
    PAGADO:     'bg-green-100 text-green-700 border border-green-200',
    PENDIENTE:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
  };
  const labels: Record<string, string> = {
    COMPLETADO: 'Completado',
    PAGADO:     'Pagado',
    PENDIENTE:  'Pendiente',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${styles[norm] ?? 'bg-neutral-200 text-neutral-600 border border-gray-200'}`}>
      {labels[norm] ?? estado}
    </span>
  );
}

// ── PaymentsList ───────────────────────────────────────────────────────────────

function PaymentsList({
  payments,
  onSelectPayment,
  loading,
  error,
}: {
  payments: PaymentItem[];
  onSelectPayment: (id: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600'] as const;

  return (
    <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
        <p className="text-sm text-neutral-400 mt-1">Gestiona tus pagos de inscripción y matrícula</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 flex items-center justify-center gap-2 text-sm text-neutral-400 animate-fade-in">
          <Spinner />
          Cargando pagos...
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-sm text-red-700 animate-fade-in">
          No se pudieron cargar los datos de pagos. Intenta recargar la página.
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-sm text-neutral-400 text-center animate-fade-in">
          No hay pagos disponibles para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {payments.map((payment, i) => (
            <button
              key={payment.id}
              onClick={() => payment.enabled && onSelectPayment(payment.id)}
              disabled={!payment.enabled}
              className={`text-left rounded-lg transition-all animate-fade-in-up ${delays[i] ?? 'delay-100'} ${
                payment.enabled ? 'hover:shadow-sm' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`rounded-lg border p-6 h-full transition-colors ${
                  payment.estado === 'pagado'
                    ? 'bg-green-50 border-green-200'
                    : payment.enabled
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        payment.estado === 'pagado'
                          ? 'bg-green-100'
                          : payment.enabled
                            ? 'bg-yellow-100'
                            : 'bg-neutral-200'
                      }`}
                    >
                      {payment.icon === 'document' ? (
                        <DocumentCurrencyDollarIcon
                          className={`w-6 h-6 ${
                            payment.estado === 'pagado'
                              ? 'text-green-700'
                              : payment.enabled
                                ? 'text-yellow-500'
                                : 'text-neutral-400'
                          }`}
                        />
                      ) : (
                        <LockClosedIcon
                          className={`w-6 h-6 ${payment.estado === 'pagado' ? 'text-green-700' : 'text-neutral-400'}`}
                        />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-base ${
                          payment.estado === 'pagado'
                            ? 'text-green-700'
                            : payment.enabled
                              ? 'text-gray-900'
                              : 'text-neutral-400'
                        }`}
                      >
                        {payment.title}
                      </h3>
                      {payment.description && (
                        <p className="text-sm text-neutral-400">{payment.description}</p>
                      )}
                    </div>
                  </div>
                  {payment.estado === 'pagado' && (
                    <div className="shrink-0 bg-green-100 rounded-full p-1.5">
                      <CheckCircleIcon className="w-5 h-5 text-green-700" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Valor</p>
                    <p
                      className={`text-xl font-bold ${
                        payment.estado === 'pagado'
                          ? 'text-green-700'
                          : payment.enabled
                            ? 'text-red-700'
                            : 'text-neutral-400'
                      }`}
                    >
                      ${payment.valor.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <div className="shrink-0">
                    {payment.estado === 'pagado' ? (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                        Pagado
                      </span>
                    ) : !payment.enabled ? (
                      <span className="inline-block bg-neutral-200 text-neutral-600 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">
                        Bloqueado
                      </span>
                    ) : (
                      <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function AspirantePagos() {
  const { mostrarAlerta, mostrarConfirm } = useOutletContext<AspiranteOutletContext>();

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [payments, setPayments]                   = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments]     = useState(true);
  const [paymentsError, setPaymentsError]         = useState<string | null>(null);

  const [inscripcionResumen, setInscripcionResumen] = useState<InscripcionResumenResponse | null>(null);
  const [paymentDetail, setPaymentDetail]           = useState<PaymentDetail | null>(null);
  const [loadingPaymentDetail, setLoadingPaymentDetail] = useState(false);

  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [loadingCheckout, setLoadingCheckout]   = useState(false);
  const [wompiCheckout, setWompiCheckout]       = useState<WompiCheckoutResponse | null>(null);
  const [miniReceipt, setMiniReceipt]           = useState<PaymentReceipt | null>(null);

  const [montoElegido, setMontoElegido]       = useState<string>('');
  const [aspiranteId, setAspiranteId]         = useState<string>('');
  const [downloadingRecibo, setDownloadingRecibo]   = useState(false);
  const [downloadingFactura, setDownloadingFactura] = useState(false);

  // Modal confirmar generar recibo
  const [mostrarConfirmarRecibo, setMostrarConfirmarRecibo] = useState(false);
  const [cerrandoConfirmarRecibo, setCerrandoConfirmarRecibo] = useState(false);

  const wompiWidgetRef = useRef<HTMLDivElement | null>(null);

  // ── Efectos de carga ───────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const id = await getAspiranteRealId();
        setAspiranteId(String(id));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudo obtener los datos del aspirante.';
        mostrarAlerta(msg);
        setPaymentsError(msg);
        setLoadingPayments(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!aspiranteId) return;
    setLoadingPayments(true);
    setPaymentsError(null);
    (async () => {
      try {
        const pagos = await fetchPayments(aspiranteId);
        setPayments(
          pagos.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            valor: p.valor,
            estado: p.estado,
            enabled: p.enabled,
            icon: p.icon ?? 'document',
          })),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudieron cargar los pagos.';
        mostrarAlerta(msg);
        setPaymentsError(msg);
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspiranteId]);

  // ── Wompi: escuchar eventos de cierre/pago ─────────────────────────────────

  useEffect(() => {
    if (!receiptGenerated) return;
    const handleWompiMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        data &&
        typeof data === 'object' &&
        typeof data.type === 'string' &&
        (data.type === 'wompi.transaction' || data.type.startsWith('wompi'))
      ) {
        window.location.reload();
      }
    };
    window.addEventListener('message', handleWompiMessage);
    return () => window.removeEventListener('message', handleWompiMessage);
  }, [receiptGenerated]);

  // ── Wompi: inyección del script del widget ─────────────────────────────────

  useEffect(() => {
    if (!receiptGenerated || !wompiWidgetRef.current || pagoCompletado) return;
    const container = wompiWidgetRef.current;
    container.innerHTML = '';
    if (!wompiCheckout) return;

    const script = document.createElement('script');
    script.src = wompiCheckout.widgetScriptUrl;
    script.setAttribute('data-render', 'button');
    script.setAttribute('data-public-key', wompiCheckout.publicKey);
    script.setAttribute('data-currency', wompiCheckout.currency);
    script.setAttribute('data-amount-in-cents', String(wompiCheckout.amountInCents));
    script.setAttribute('data-reference', wompiCheckout.reference);
    script.setAttribute('data-signature:integrity', wompiCheckout.signatureIntegrity);
    if (wompiCheckout.redirectUrl) {
      script.setAttribute('data-redirect-url', wompiCheckout.redirectUrl);
    }
    container.appendChild(script);
    return () => { container.innerHTML = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptGenerated, wompiCheckout]);

  // ── Valores derivados ──────────────────────────────────────────────────────

  const selectedPayment = payments.find(p => p.id === selectedPaymentId) ?? null;
  const isMatricula     = selectedPayment?.title === 'Matrícula';
  const pagoCompletado  = inscripcionResumen?.estado?.toUpperCase() === 'COMPLETADO';

  const paymentData = {
    aspirante: inscripcionResumen?.aspirante ?? 'No disponible',
    documento:  inscripcionResumen?.documento  ?? 'No disponible',
    programa:   inscripcionResumen?.programa   ?? 'No disponible',
    facultad:   inscripcionResumen?.facultad   ?? 'No disponible',
    periodo:    inscripcionResumen?.periodo    ?? 'No disponible',
    tipo:       inscripcionResumen?.tipo       ?? 'No disponible',
    valor:      inscripcionResumen?.valor      ?? 0,
    estado:     inscripcionResumen?.estado     ?? null,
  };

  // ── Cierre animado del modal ───────────────────────────────────────────────

  const cerrarConfirmarRecibo = () => {
    setCerrandoConfirmarRecibo(true);
    setTimeout(() => {
      setMostrarConfirmarRecibo(false);
      setCerrandoConfirmarRecibo(false);
    }, 170);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelectPayment = (paymentId: string) => {
    (async () => {
      setSelectedPaymentId(paymentId);
      setReceiptGenerated(false);
      setPaymentDetail(null);
      setInscripcionResumen(null);
      setWompiCheckout(null);
      setMiniReceipt(null);
      setMontoElegido('');
      setLoadingPaymentDetail(true);

      const payment = payments.find(p => p.id === paymentId) ?? null;
      if (!aspiranteId) { setLoadingPaymentDetail(false); return; }

      try {
        if (payment?.title === 'Inscripción') {
          const resumen = await fetchInscripcionResumen(aspiranteId);
          setInscripcionResumen(resumen);
        } else if (payment?.title !== 'Matrícula') {
          const detail = await fetchPaymentDetail(aspiranteId, paymentId);
          setPaymentDetail(detail);
        }
        // Matrícula: espera que el usuario ingrese el monto primero
      } catch (e) {
        mostrarAlerta(e instanceof Error ? e.message : 'No se pudo cargar el detalle del pago.');
      } finally {
        setLoadingPaymentDetail(false);
      }
    })();
  };

  const handleGenerateReceipt = () => {
    (async () => {
      if (!selectedPaymentId) return;
      try {
        setLoadingCheckout(true);
        let checkoutData: WompiCheckoutResponse;

        if (isMatricula) {
          const monto = parseFloat(montoElegido.replace(/[^0-9.]/g, ''));
          const [checkout, resumen] = await Promise.all([
            fetchMatriculaCheckout(String(aspiranteId), monto),
            fetchMatriculaResumen(String(aspiranteId), monto).catch(() => null),
          ]);
          checkoutData = checkout;
          if (resumen) setInscripcionResumen(resumen);
        } else {
          checkoutData = await fetchInscripcionCheckout(String(aspiranteId));
        }

        setWompiCheckout(checkoutData);
        setMiniReceipt({
          id:       String(checkoutData.paymentId ?? checkoutData.transactionId ?? '0'),
          number:   String(checkoutData.reference ?? checkoutData.transactionId ?? 'N/A'),
          date:     checkoutData.creationDate ?? new Date().toISOString(),
          dueDate:  checkoutData.pagoreciboinscripcion?.fechavencimiento ?? undefined,
          amount:   typeof checkoutData.amount === 'number'
            ? checkoutData.amount
            : Math.round((checkoutData.amountInCents ?? 0) / 100),
          currency: checkoutData.currency ?? 'COP',
          pdfUrl:   checkoutData.pagoreciboinscripcion?.urlrecibo ?? checkoutData.checkoutUrl ?? undefined,
        });
        setReceiptGenerated(true);
        mostrarConfirm('Recibo generado con éxito.');
      } catch (e) {
        mostrarAlerta(e instanceof Error ? e.message : 'No se pudo generar el recibo de pago.');
      } finally {
        setLoadingCheckout(false);
      }
    })();
  };

  const handleBackToList = () => {
    setSelectedPaymentId(null);
    setReceiptGenerated(false);
    setMontoElegido('');
    setInscripcionResumen(null);
    setWompiCheckout(null);
    setMiniReceipt(null);
  };

  // ── Vista de lista ─────────────────────────────────────────────────────────

  if (!selectedPaymentId) {
    return (
      <PaymentsList
        payments={payments}
        onSelectPayment={handleSelectPayment}
        loading={loadingPayments}
        error={paymentsError}
      />
    );
  }

  const now         = new Date();
  const receiptDate = now.toLocaleDateString('es-CO');
  const dueDate     = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO');

  // ── Encabezado reutilizable ────────────────────────────────────────────────

  const encabezado = (
    <div className="flex items-center gap-4 animate-fade-in">
      <button
        onClick={handleBackToList}
        className="p-2 rounded-lg border border-gray-200 bg-white text-red-700 transition hover:border-gray-300 hover:bg-red-50"
        aria-label="Regresar"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
        <p className="text-sm text-neutral-400">Gestiona tus pagos de inscripción y matrícula</p>
      </div>
    </div>
  );

  // ── Mientras carga el resumen (inscripción o matrícula) solo mostrar encabezado ──

  if (loadingPaymentDetail || loadingCheckout) {
    return (
      <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="space-y-6">
          {encabezado}
          <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
            <Spinner className="h-7 w-7 text-red-700" />
            <p className="text-sm text-neutral-400">Cargando información del pago...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista de detalle ───────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="space-y-6">

        {/* Encabezado */}
        {encabezado}

        {/* Input de monto (solo Matrícula) */}
        {isMatricula && (
          <div className="space-y-2 animate-fade-in-up delay-100">
            <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
              <CurrencyDollarIcon className="w-5 h-5" /> Monto a Pagar
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <p className="text-sm text-neutral-400">
                Ingresa el valor total que deseas pagar por concepto de matrícula.
              </p>
              <input
                type="number"
                min="0"
                placeholder="Ej: 2500000"
                value={montoElegido}
                disabled={receiptGenerated || loadingCheckout}
                onChange={(e) => {
                  setMontoElegido(e.target.value);
                  setInscripcionResumen(null);
                  setReceiptGenerated(false);
                  setWompiCheckout(null);
                  setMiniReceipt(null);
                }}
                className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-200 disabled:bg-gray-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Información del pago (solo cuando el resumen ya cargó) */}
        {inscripcionResumen && (
        <div className="space-y-2 animate-fade-in-up delay-200">
          <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
            <DocumentTextIcon className="w-5 h-5" />
            Información de {isMatricula ? 'la Matrícula' : 'la Inscripción'}
          </h3>
          {(
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Programa</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.programa}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Facultad</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.facultad}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Periodo</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.periodo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TagIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Tipo</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.tipo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Aspirante</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.aspirante}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Valor</p>
                    <p className="text-lg font-bold text-red-700 mt-0.5">
                      ${paymentData.valor.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IdentificationIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-400">Documento</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.documento}</p>
                  </div>
                </div>
                {paymentData.estado && (
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Estado</p>
                      <div className="mt-1">
                        <EstadoPagoBadge estado={paymentData.estado} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Si el pago está COMPLETADO: mostrar descarga de recibo/factura */}
        {pagoCompletado && inscripcionResumen && (
          <div className="flex justify-center animate-fade-in-up delay-300">
            <div className="w-full max-w-md space-y-2">
            <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
              <DocumentCurrencyDollarIcon className="w-5 h-5" /> Estado del Pago
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg shrink-0">
                  <CheckCircleIcon className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-green-700">Pago realizado</p>
                  <p className="text-sm text-green-600">El pago ha sido procesado exitosamente.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {inscripcionResumen.urlrecibo && (
                  <button
                    onClick={() => {
                      setDownloadingRecibo(true);
                      window.open(inscripcionResumen.urlrecibo!, '_blank');
                      setTimeout(() => setDownloadingRecibo(false), 800);
                    }}
                    disabled={downloadingRecibo}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-700 text-white font-semibold text-sm rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingRecibo
                      ? <><Spinner className="text-white" /> Descargando...</>
                      : <><ArrowDownTrayIcon className="w-4 h-4 shrink-0" /> Descargar Recibo</>}
                  </button>
                )}
                {inscripcionResumen.urlfactura && (
                  <button
                    onClick={() => {
                      setDownloadingFactura(true);
                      window.open(inscripcionResumen.urlfactura!, '_blank');
                      setTimeout(() => setDownloadingFactura(false), 800);
                    }}
                    disabled={downloadingFactura}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border border-green-200 text-green-700 font-semibold text-sm rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingFactura
                      ? <><Spinner className="text-green-700" /> Descargando...</>
                      : <><DocumentTextIcon className="w-4 h-4 shrink-0" /> Descargar Factura</>}
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Sección Generar Recibo (solo si NO está completado) */}
        {!pagoCompletado && (
          <div className="space-y-2 animate-fade-in-up delay-300">
            <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
              <DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
              <p className="text-sm text-neutral-400">
                Genera tu recibo de pago para continuar con {isMatricula ? 'la matrícula' : 'la inscripción'}.
              </p>
              <button
                onClick={() => setMostrarConfirmarRecibo(true)}
                disabled={
                  receiptGenerated ||
                  loadingCheckout ||
                  (isMatricula && (!montoElegido || parseFloat(montoElegido) <= 0))
                }
                className={`font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition ${
                  receiptGenerated
                    ? 'bg-green-700 text-white cursor-not-allowed'
                    : 'bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {receiptGenerated ? (
                  <><CheckCircleIcon className="w-5 h-5" /> Recibo Generado</>
                ) : loadingCheckout ? (
                  <><Spinner className="text-white" /> Generando recibo...</>
                ) : (
                  <><DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recibo generado + widget Wompi */}
        {receiptGenerated && !pagoCompletado && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Tarjeta de recibo */}
              <div
                className={`border-2 border-dashed rounded-lg p-5 space-y-4 ${
                  selectedPayment?.estado === 'pagado' ? 'border-green-300' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-gray-900">{selectedPayment?.title ?? 'RECIBO DE PAGO'}</h4>
                    <p className={`font-semibold text-sm mt-0.5 ${selectedPayment?.estado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>
                      N° {miniReceipt?.number ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                      <AcademicCapIcon className="w-4 h-4" /> Programa
                    </span>
                    <span className="font-medium text-gray-900 text-right text-xs">{paymentData.programa}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                      <UserIcon className="w-4 h-4" /> Aspirante
                    </span>
                    <span className="font-medium text-gray-900 text-right text-xs">{paymentData.aspirante}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                      <CalendarIcon className="w-4 h-4" /> Fecha generación
                    </span>
                    <span className="font-medium text-gray-900 text-right text-xs">
                      {miniReceipt ? new Date(miniReceipt.date).toLocaleDateString('es-CO') : receiptDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                      <CalendarIcon className="w-4 h-4" /> Vencimiento
                    </span>
                    <span className="font-medium text-gray-900 text-right text-xs">
                      {miniReceipt?.dueDate
                        ? new Date(miniReceipt.dueDate).toLocaleDateString('es-CO')
                        : dueDate}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-sm text-gray-900">VALOR A PAGAR:</p>
                  <p className={`font-bold flex items-center gap-1 ${selectedPayment?.estado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>
                    <CurrencyDollarIcon className="w-4 h-4 shrink-0" />
                    ${(miniReceipt?.amount ?? selectedPayment?.valor ?? paymentData.valor).toLocaleString('es-CO')} {miniReceipt?.currency ?? 'COP'}
                  </p>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-sm text-gray-900">ESTADO:</p>
                  {selectedPayment?.estado === 'pagado' ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Pagado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-200">
                      <InformationCircleIcon className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </div>
              </div>

              {/* Columna de acciones */}
              <div className="space-y-4">

                {/* Descargar recibo/factura: solo si el resumen ya cargó */}
                {inscripcionResumen && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900 text-sm">
                    <PrinterIcon className="w-4 h-4 text-red-700" /> Descargar / Imprimir
                  </h4>
                  <p className="text-xs text-neutral-400">Descarga tu recibo en formato PDF</p>
                  <button
                    onClick={() => {
                      const url = inscripcionResumen?.urlrecibo ?? miniReceipt?.pdfUrl ?? wompiCheckout?.checkoutUrl;
                      if (!url) return;
                      setDownloadingRecibo(true);
                      window.open(url, '_blank');
                      setTimeout(() => setDownloadingRecibo(false), 800);
                    }}
                    disabled={downloadingRecibo || !(inscripcionResumen?.urlrecibo ?? miniReceipt?.pdfUrl ?? wompiCheckout?.checkoutUrl)}
                    className="font-semibold text-sm text-red-700 border border-red-200 bg-white flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingRecibo
                      ? <><Spinner /> Preparando descarga...</>
                      : <><ArrowDownTrayIcon className="w-4 h-4 shrink-0" /> Descargar Recibo</>}
                  </button>
                  {inscripcionResumen?.urlfactura && (
                    <button
                      onClick={() => {
                        setDownloadingFactura(true);
                        window.open(inscripcionResumen.urlfactura!, '_blank');
                        setTimeout(() => setDownloadingFactura(false), 800);
                      }}
                      disabled={downloadingFactura}
                      className="font-semibold text-sm text-red-700 border border-red-200 bg-white flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingFactura
                        ? <><Spinner /> Preparando descarga...</>
                        : <><DocumentTextIcon className="w-4 h-4 shrink-0" /> Descargar Factura</>}
                    </button>
                  )}
                </div>
                )}

                {/* Pago en línea (Wompi) */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900 text-sm">
                    <CreditCardIcon className="w-4 h-4 text-red-700" /> Pagar en Línea
                  </h4>
                  <p className="text-xs text-neutral-400">Realiza el pago de forma segura</p>
                  {selectedPayment?.estado === 'pagado' ? (
                    <div className="font-semibold flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-700 text-white text-sm">
                      <CheckCircleIcon className="w-4 h-4 shrink-0" /> Pagado
                    </div>
                  ) : loadingCheckout ? (
                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-neutral-400 flex items-center justify-center gap-2">
                      <Spinner /> Cargando botón de pago...
                    </div>
                  ) : (
                    <form>
                      <div ref={wompiWidgetRef} />
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Confirmar generación de recibo */}
      {mostrarConfirmarRecibo && (
        <div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
            cerrandoConfirmarRecibo ? 'animate-overlay-out' : 'animate-overlay-in'
          }`}
        >
          <div
            className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${
              cerrandoConfirmarRecibo ? 'animate-modal-out' : 'animate-modal-in'
            }`}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Confirmar generación de recibo</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">
                ¿Deseas generar el recibo de pago para{' '}
                <strong>{isMatricula ? 'la matrícula' : 'la inscripción'}</strong>?
                {isMatricula && montoElegido && parseFloat(montoElegido) > 0 && (
                  <>
                    {' '}El monto a pagar será de{' '}
                    <strong className="text-red-700">
                      ${parseFloat(montoElegido).toLocaleString('es-CO')} COP
                    </strong>.
                  </>
                )}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarConfirmarRecibo}
                disabled={loadingCheckout}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  cerrarConfirmarRecibo();
                  handleGenerateReceipt();
                }}
                disabled={loadingCheckout}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCheckout
                  ? <><Spinner className="text-white" /> Generando...</>
                  : 'Sí, generar recibo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
