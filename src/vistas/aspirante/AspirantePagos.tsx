import { useState, useEffect, useRef } from 'react';
import {
  CreditCardIcon,
  DocumentCurrencyDollarIcon,
  InformationCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
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
  fetchPaymentDetail,
  initiatePayment,
  confirmPayment,
} from '../../services/aspirante/aspirantePagosService';
import { getAspiranteRealId } from '../../services/aspirante/aspiranteService';
import type {
  InscripcionResumenResponse,
  PaymentDetail,
  PaymentReceipt,
  WompiCheckoutResponse,
} from '../../services/aspirante/aspirantePagosService';

interface PaymentItem {
  id: string;
  title: string;
  description: string;
  valor: number;
  estado: 'pendiente' | 'pagado';
  enabled: boolean;
  icon: 'document' | 'lock';
}

function Spinner({ className }: { className?: string }) {
  const colorClass = className ?? 'text-red-700';
  return (
    <svg className={`animate-spin h-5 w-5 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function PaymentsList({
  payments,
  onSelectPayment,
  loading,
  error,
}: {
  payments: PaymentItem[];
  onSelectPayment: (paymentId: string) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
          <p className="text-sm text-neutral-400 mt-1">Gestiona tus pagos de inscripción y matrícula</p>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Spinner />
            Cargando pagos...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-red-200 p-8 text-sm text-red-700">
            No se pudieron cargar los datos.
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-sm text-neutral-400">
            No hay pagos disponibles para mostrar.
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up delay-100 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
            {payments.map((payment) => (
              <button
                key={payment.id}
                onClick={() => payment.enabled && onSelectPayment(payment.id)}
                disabled={!payment.enabled}
                className={`text-left transition-all rounded-lg ${
                  !payment.enabled ? 'cursor-not-allowed opacity-60' : 'hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div
                  className={`rounded-lg border border-gray-200 p-6 bg-white ${
                    payment.estado === 'pagado' ? 'bg-green-100 border-green-200' : 'bg-white border-gray-200'
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
                                  ? 'text-yellow-400'
                                  : 'text-neutral-400'
                            }`}
                          />
                        ) : (
                          <LockClosedIcon
                            className={`w-6 h-6 ${
                              payment.estado === 'pagado' ? 'text-green-700' : 'text-neutral-400'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-bold text-lg ${
                            payment.estado === 'pagado'
                              ? 'text-green-700'
                              : payment.enabled
                                ? 'text-gray-900'
                                : 'text-neutral-400'
                          }`}
                        >
                          {payment.title}
                        </h3>
                        <p className="text-sm text-neutral-400">{payment.description}</p>
                      </div>
                    </div>

                    {payment.estado === 'pagado' && (
                      <div className="shrink-0">
                        <div className="bg-green-100 rounded-full p-2">
                          <CheckCircleIcon className="w-6 h-6 text-green-700" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-neutral-400">Valor</p>
                      <p
                        className={`text-2xl font-bold ${
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
                        <span className="inline-block bg-green-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Pagado
                        </span>
                      ) : !payment.enabled ? (
                        <span className="inline-block bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
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
    </div>
  );
}

export default function AspirantePagos() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [wompiCheckout, setWompiCheckout] = useState<WompiCheckoutResponse | null>(null);
  const [miniReceipt, setMiniReceipt] = useState<PaymentReceipt | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [inscripcionResumen, setInscripcionResumen] = useState<InscripcionResumenResponse | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvc: '',
  });

  // Datos y estados traídos del servicio
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [loadingPaymentDetail, setLoadingPaymentDetail] = useState<boolean>(false);
  const [aspiranteId, setAspiranteId] = useState<string>('');
  const wompiWidgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getAspiranteRealId().then(id => setAspiranteId(String(id)));
  }, []);

  useEffect(() => {
    if (!aspiranteId) return;

    setLoadingPayments(true);
    setPaymentsError(null);

    (async () => {
      try {
        const pagos = await fetchPayments(aspiranteId);
        setPayments(
          pagos.map((pago) => ({
            id: pago.id,
            title: pago.title,
            description: pago.description,
            valor: pago.valor,
            estado: pago.estado,
            enabled: pago.enabled,
            icon: pago.icon ?? 'document',
          })),
        );
      } catch (e) {
        console.warn(e);
        setPaymentsError('No se pudieron cargar los datos.');
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    })();
  }, [aspiranteId]);

  useEffect(() => {
    if (!aspiranteId) return;

    (async () => {
      try {
        const resumen = await fetchInscripcionResumen(aspiranteId);
        setInscripcionResumen(resumen);
      } catch (e) {
        console.warn(e);
        setInscripcionResumen(null);
      }
    })();
  }, [aspiranteId]);

  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? null;

  const handleSelectPayment = (paymentId: string) => {
    (async () => {
      setSelectedPaymentId(paymentId);
      setReceiptGenerated(false);
      setPaymentDetail(null);
      setLoadingPaymentDetail(true);

      const payment = payments.find((p) => p.id === paymentId) ?? null;
      if (!aspiranteId) {
        setLoadingPaymentDetail(false);
        return;
      }

      try {
        if (payment?.title === 'Inscripción') {
          const resumen = await fetchInscripcionResumen(aspiranteId);
          setInscripcionResumen(resumen);
        } else {
          const detail = await fetchPaymentDetail(aspiranteId, paymentId);
          setPaymentDetail(detail);
        }
      } catch (e) {
        console.warn('Error loading payment detail/resumen', e);
        // keep previous states null so UI can show fallback
      } finally {
        setLoadingPaymentDetail(false);
      }
    })();
  };

  useEffect(() => {
    if (!receiptGenerated || !wompiWidgetRef.current || selectedPayment?.estado === 'pagado') return;

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

    return () => {
      container.innerHTML = '';
    };
  }, [receiptGenerated, selectedPayment?.estado, wompiCheckout]);

  const paymentData = {
    aspirante: inscripcionResumen?.aspirante ?? 'No disponible',
    documento: inscripcionResumen?.documento ?? 'No disponible',
    programa: inscripcionResumen?.programa ?? 'No disponible',
    facultad: inscripcionResumen?.facultad ?? 'No disponible',
    periodo: inscripcionResumen?.periodo ?? 'No disponible',
    tipo: inscripcionResumen?.tipo ?? 'No disponible',
    valor: inscripcionResumen?.valor ?? 0,
  };

  const handleGenerateReceipt = () => {
    (async () => {
      if (!selectedPaymentId) return;
      try {
        setLoadingCheckout(true);
        setCheckoutError(null);
        const checkoutData = await fetchInscripcionCheckout(String(aspiranteId));
        setWompiCheckout(checkoutData);
        // Fill mini-receipt using checkout JSON
        setMiniReceipt({
          id: String(checkoutData.paymentId ?? checkoutData.transactionId ?? '0'),
          number: String(checkoutData.reference ?? checkoutData.transactionId ?? 'N/A'),
          date: new Date().toISOString(),
          dueDate: undefined,
          amount: checkoutData.amount ?? checkoutData.amountInCents ? (checkoutData.amount ?? Math.round((checkoutData.amountInCents ?? 0) / 100)) : (selectedPayment?.valor ?? 0),
          currency: checkoutData.currency ?? 'COP',
          pdfUrl: checkoutData.checkoutUrl ?? undefined,
        });
        setReceiptGenerated(true);
      } catch (e) {
        console.warn(e);
        setCheckoutError('No se pudo cargar la configuración de pago en línea.');
        setReceiptGenerated(true);
      } finally {
        setLoadingCheckout(false);
      }
    })();
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) return;
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleProcessPayment = () => {
    (async () => {
      if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiry || !cardData.cvc) {
        alert('Por favor completa todos los campos');
        return;
      }

      if (!selectedPaymentId) return;
      setPaymentProcessing(true);
      try {
        const init = await initiatePayment(String(aspiranteId), selectedPaymentId, {
          method: 'wompi',
          amount: selectedPayment?.valor ?? paymentDetail?.valor,
        });
        // Si init.paymentUrl -> redirigir a checkout externo
        if (init.paymentUrl) window.open(init.paymentUrl, '_blank');

        const confirmed = await confirmPayment(String(aspiranteId), selectedPaymentId, init.transactionId);
        if (confirmed.success) {
          setPayments((prev) =>
            prev.map((payment) =>
              payment.id === selectedPaymentId ? { ...payment, estado: 'pagado' } : payment,
            ),
          );
          setPaymentDetail((d) =>
            d
              ? {
                  ...d,
                  receipt: {
                    id: confirmed.receiptId ?? 'r-unk',
                    number: confirmed.receiptId ?? 'RC-unk',
                    date: confirmed.paidAt ?? new Date().toISOString(),
                    amount: selectedPayment?.valor ?? paymentDetail?.valor ?? 0,
                    currency: 'COP',
                  },
                }
              : d,
          );
          setReceiptGenerated(true);
        } else {
          alert('El pago no pudo confirmarse.');
        }
      } catch (e) {
        // en modo dev el servicio hace fallback a mock; manejar errores
        console.error('payment error', e);
        alert('Error procesando el pago');
      } finally {
        setPaymentProcessing(false);
        setShowPaymentModal(false);
        setCardData({ cardNumber: '', cardHolder: '', expiry: '', cvc: '' });
      }
    })();
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setCardData({ cardNumber: '', cardHolder: '', expiry: '', cvc: '' });
  };

  const handleBackToList = () => {
    setSelectedPaymentId(null);
    setReceiptGenerated(false);
  };

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

  const now = new Date();
  const receiptDate = now.toLocaleDateString('es-CO');
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO');

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2 animate-fade-in">
          <button
            onClick={handleBackToList}
            className="p-2 rounded-lg border border-gray-200 bg-white text-red-700 transition hover:border-gray-300"
            aria-label="Regresar"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
            <p className="text-sm text-neutral-400">Gestiona tus pagos de inscripción y matrícula</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
            <DocumentTextIcon className="w-5 h-5" /> Información de la Inscripción
          </h3>
          {loadingPaymentDetail ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Programa</strong>
                    <span className="text-neutral-400">{paymentData.programa}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Periodo</strong>
                    <span className="text-neutral-400">{paymentData.periodo}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Aspirante</strong>
                    <span className="text-neutral-400">{paymentData.aspirante}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IdentificationIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Documento</strong>
                    <span className="text-neutral-400">{paymentData.documento}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Facultad</strong>
                    <span className="text-neutral-400">{paymentData.facultad}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TagIcon className="w-5 h-5 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Tipo</strong>
                    <span className="text-neutral-400">{paymentData.tipo}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="w-6 h-6 text-red-700 mt-1 shrink-0" />
                  <div className="grid grid-cols-[100px_1fr]">
                    <strong className="text-gray-900">Valor</strong>
                    <span className="text-red-700 text-xl font-bold">
                      ${paymentData.valor.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
            <DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
            <p className="text-neutral-400">Genera tu recibo de pago para continuar con la inscripción.</p>
            <button
              onClick={handleGenerateReceipt}
              disabled={receiptGenerated || loadingCheckout}
              className={`font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition ${
                receiptGenerated
                  ? 'bg-green-700 text-white cursor-not-allowed'
                  : 'bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              {receiptGenerated ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Recibo Generado
                </>
              ) : loadingCheckout ? (
                <>
                  <Spinner className="text-white" />
                  Generando recibo...
                </>
              ) : (
                <>
                  <DocumentCurrencyDollarIcon className="w-5 h-5" />
                  Generar Recibo de Pago
                </>
              )}
            </button>
          </div>
        </div>

        {receiptGenerated && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className={`border-2 border-dashed rounded-lg p-5 space-y-4 bg-white ${
                  selectedPayment?.estado === 'pagado' ? 'border-green-300' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-3">
                  <div>
                    <h4 className="font-bold text-lg">{selectedPayment?.title ?? 'RECIBO DE PAGO'}</h4>
                    <p className={`font-bold text-sm ${selectedPayment?.estado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>
                      N° {miniReceipt?.number ?? '123456'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <CalendarIcon className="w-4 h-4" /> Fecha de generación
                    </span>
                    <span className="font-medium text-gray-900">{miniReceipt ? new Date(miniReceipt.date).toLocaleDateString('es-CO') : receiptDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <CalendarIcon className="w-4 h-4" /> Fecha de vencimiento
                    </span>
                    <span className="font-medium text-gray-900">{miniReceipt?.dueDate ? new Date(miniReceipt.dueDate).toLocaleDateString('es-CO') : dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <UserIcon className="w-4 h-4" /> Aspirante
                    </span>
                    <span className="font-medium text-gray-900">{paymentData.aspirante}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <AcademicCapIcon className="w-4 h-4" /> Programa
                    </span>
                    <span className="font-medium text-gray-900">{paymentData.programa}</span>
                  </div>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-gray-900">VALOR A PAGAR:</p>
                    <p className={`text-xl font-bold flex items-center gap-1 ${selectedPayment?.estado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>
                      <CurrencyDollarIcon className="w-5 h-5" />
                      ${((miniReceipt?.amount ?? selectedPayment?.valor ?? paymentData.valor)).toLocaleString('es-CO')} {miniReceipt?.currency ?? 'COP'}
                    </p>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-gray-900">ESTADO:</p>
                  {selectedPayment?.estado === 'pagado' ? (
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                      <CheckCircleIcon className="w-4 h-4 inline-block mr-1" />
                      Pagado
                    </span>
                  ) : (
                    <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
                      <InformationCircleIcon className="w-4 h-4 inline-block mr-1" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900">
                    <PrinterIcon className="w-5 h-5 text-red-700" />
                    Descargar / Imprimir
                  </h4>
                  <p className="text-sm text-neutral-400">Descarga tu recibo en formato PDF</p>
                  <button
                    onClick={() => {
                      const url = miniReceipt?.pdfUrl ?? wompiCheckout?.checkoutUrl;
                      if (!url) return;
                      try {
                        setDownloadingReceipt(true);
                        window.open(url, '_blank');
                      } finally {
                        setTimeout(() => setDownloadingReceipt(false), 800);
                      }
                    }}
                    disabled={downloadingReceipt}
                    className="font-bold text-red-700 border border-red-200 bg-white flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    {downloadingReceipt ? (
                      <>
                        <Spinner />
                        Preparando descarga...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Descargar Recibo
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900">
                    <CreditCardIcon className="w-5 h-5 text-red-700" />
                    Pagar en Línea
                  </h4>
                  <p className="text-sm text-neutral-400">Realiza el pago de forma segura</p>
                  {selectedPayment?.estado === 'pagado' ? (
                    <div className="font-bold flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-green-700 text-white">
                      <CheckCircleIcon className="w-5 h-5" />
                      Pagado
                    </div>
                  ) : loadingCheckout ? (
                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-neutral-400 flex items-center justify-center gap-2">
                      <Spinner />
                      Cargando botón de pago...
                    </div>
                  ) : checkoutError ? (
                    <div className="w-full px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                      {checkoutError}
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

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-red-700 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Pago Seguro Wompi
              </h3>
              <button
                onClick={closePaymentModal}
                className="hover:bg-red-800 p-1 rounded transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Monto a pagar</p>
                <p className="text-3xl font-bold text-red-700">
                  ${(selectedPayment?.valor ?? paymentData.valor).toLocaleString('es-CO')} COP
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Tu pago es 100% seguro y encriptado con Wompi</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={handleCardInputChange}
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titular de la Tarjeta</label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="JUAN PEREZ"
                    value={cardData.cardHolder}
                    onChange={(e) =>
                      setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      placeholder="123"
                      value={cardData.cvc}
                      onChange={handleCardInputChange}
                      maxLength={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closePaymentModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={paymentProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                    paymentProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      Pagar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
