import { useState } from 'react';
import {
  CreditCardIcon,
  DocumentCurrencyDollarIcon,
  InformationCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
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
  QuestionMarkCircleIcon,
  PhoneIcon,
  ArrowLeftIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface PaymentItem {
  id: string;
  title: string;
  description: string;
  valor: number;
  estado: 'pendiente' | 'pagado';
  enabled: boolean;
  icon: 'document' | 'lock';
}

function PaymentsList({
  payments,
  onSelectPayment,
}: {
  payments: PaymentItem[];
  onSelectPayment: (paymentId: string) => void;
}) {
  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="bg-red-700 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-red-100 text-sm mt-1">Gestiona tus pagos de inscripción y matrícula</p>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pagos Pendientes</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {payments.map((payment) => (
            <button
              key={payment.id}
              onClick={() => payment.enabled && onSelectPayment(payment.id)}
              disabled={!payment.enabled}
              className={`text-left transition-all ${
                !payment.enabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:border-red-300'
              }`}
            >
              <div
                className={`rounded-lg border-2 p-6 ${
                  payment.estado === 'pagado'
                    ? 'bg-green-50 border-green-200'
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
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      {payment.icon === 'document' ? (
                        <DocumentCurrencyDollarIcon
                          className={`w-6 h-6 ${
                            payment.estado === 'pagado'
                              ? 'text-green-700'
                              : payment.enabled
                                ? 'text-red-700'
                                : 'text-gray-500'
                          }`}
                        />
                      ) : (
                        <LockClosedIcon
                          className={`w-6 h-6 ${
                            payment.estado === 'pagado' ? 'text-green-700' : 'text-gray-500'
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
                              ? 'text-gray-800'
                              : 'text-gray-500'
                        }`}
                      >
                        {payment.title}
                      </h3>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                    </div>
                  </div>

                  {payment.estado === 'pagado' && (
                    <div className="flex-shrink-0">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircleIcon className="w-6 h-6 text-green-700" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p
                      className={`text-2xl font-bold ${
                        payment.estado === 'pagado'
                          ? 'text-green-700'
                          : payment.enabled
                            ? 'text-red-700'
                            : 'text-gray-500'
                      }`}
                    >
                      ${payment.valor.toLocaleString('es-CO')} COP
                    </p>
                  </div>

                  <div className="flex-shrink-0">
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
      </main>
    </div>
  );
}

export default function AspirantePagos() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentsState, setPaymentsState] = useState<Record<string, 'pendiente' | 'pagado'>>({
    inscripcion: 'pendiente',
    legalizacion: 'pendiente',
  });
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvc: '',
  });

  const paymentData = {
    aspirante: 'Juan Pérez García',
    documento: '1.090.123.456',
    programa: 'Maestría en Gerencia de Proyectos',
    facultad: 'Ingenierías',
    periodo: '2026-1',
    tipo: 'Nuevo Aspirante',
    valor: 150000,
  };

  const payments: PaymentItem[] = [
    {
      id: 'inscripcion',
      title: 'Pago de Inscripción',
      description: 'Maestría en Gerencia de Proyectos',
      valor: 150000,
      estado: paymentsState.inscripcion as 'pendiente' | 'pagado',
      enabled: true,
      icon: 'document',
    },
    {
      id: 'legalizacion',
      title: 'Legalización de Matrícula',
      description: 'Proceso de formalización',
      valor: 200000,
      estado: paymentsState.legalizacion as 'pendiente' | 'pagado',
      enabled: false,
      icon: 'lock',
    },
  ];

  const handleGenerateReceipt = () => {
    setReceiptGenerated(true);
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
    if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiry || !cardData.cvc) {
      alert('Por favor completa todos los campos');
      return;
    }

    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentsState(prev => ({
        ...prev,
        inscripcion: 'pagado',
      }));
      setShowPaymentModal(false);
      setCardData({ cardNumber: '', cardHolder: '', expiry: '', cvc: '' });
    }, 2000);
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
    return <PaymentsList payments={payments} onSelectPayment={setSelectedPaymentId} />;
  }

  const now = new Date();
  const receiptDate = now.toLocaleDateString('es-CO');
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO');

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="bg-red-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-red-800 rounded-lg transition"
              aria-label="Regresar"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Pagos</h1>
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <span>{paymentData.aspirante}</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="flex text-xl font-bold text-red-700 gap-2 items-center">
            <DocumentTextIcon className="w-5 h-5" /> Información de la Inscripción
          </h3>
          <div className="grid md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AcademicCapIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Programa</strong>
                  <span className="text-gray-600">{paymentData.programa}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Periodo</strong>
                  <span className="text-gray-600">{paymentData.periodo}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Aspirante</strong>
                  <span className="text-gray-600">{paymentData.aspirante}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IdentificationIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Documento</strong>
                  <span className="text-gray-600">{paymentData.documento}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Facultad</strong>
                  <span className="text-gray-600">{paymentData.facultad}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TagIcon className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Tipo</strong>
                  <span className="text-gray-600">{paymentData.tipo}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CurrencyDollarIcon className="w-6 h-6 text-red-700 mt-1 flex-shrink-0" />
                <div className="grid grid-cols-[100px_1fr]">
                  <strong className="text-gray-700">Valor</strong>
                  <span className="text-red-700 text-xl font-bold">
                    ${paymentData.valor.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="flex text-xl font-bold text-red-700 gap-2 items-center">
            <DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
            <p className="text-gray-600">Genera tu recibo de pago para continuar con la inscripción.</p>
            <button
              onClick={handleGenerateReceipt}
              disabled={receiptGenerated}
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
                  paymentsState.inscripcion === 'pagado' ? 'border-green-300' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-3">
                  <div>
                    <h4 className="font-bold text-lg">RECIBO DE PAGO</h4>
                    <p
                      className={`font-bold text-sm ${
                        paymentsState.inscripcion === 'pagado' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      N° 123456
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-600">
                      <CalendarIcon className="w-4 h-4" /> Fecha de generación
                    </span>
                    <span className="font-medium text-gray-800">{receiptDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-600">
                      <CalendarIcon className="w-4 h-4" /> Fecha de vencimiento
                    </span>
                    <span className="font-medium text-gray-800">{dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-600">
                      <UserIcon className="w-4 h-4" /> Aspirante
                    </span>
                    <span className="font-medium text-gray-800">{paymentData.aspirante}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-600">
                      <AcademicCapIcon className="w-4 h-4" /> Programa
                    </span>
                    <span className="font-medium text-gray-800">{paymentData.programa}</span>
                  </div>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-gray-800">VALOR A PAGAR:</p>
                  <p
                    className={`text-xl font-bold flex items-center gap-1 ${
                      paymentsState.inscripcion === 'pagado' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    ${paymentData.valor.toLocaleString('es-CO')} COP
                  </p>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-gray-800">ESTADO:</p>
                  {paymentsState.inscripcion === 'pagado' ? (
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
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-800">
                    <PrinterIcon className="w-5 h-5 text-red-700" />
                    Descargar / Imprimir
                  </h4>
                  <p className="text-sm text-gray-500">Descarga tu recibo en formato PDF</p>
                  <button className="font-bold text-red-700 border border-red-700 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Descargar Recibo
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-800">
                    <CreditCardIcon className="w-5 h-5 text-red-700" />
                    Pagar en Línea
                  </h4>
                  <p className="text-sm text-gray-500">Realiza el pago de forma segura</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={paymentsState.inscripcion === 'pagado'}
                    className={`font-bold flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg transition ${
                      paymentsState.inscripcion === 'pagado'
                        ? 'bg-green-700 text-white cursor-not-allowed'
                        : 'bg-red-700 text-white hover:bg-red-800'
                    }`}
                  >
                    {paymentsState.inscripcion === 'pagado' ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Pagado
                      </>
                    ) : (
                      <>
                        Pagar Ahora
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-red-100 border border-red-200 rounded-lg px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-700 text-white rounded-full p-3 flex-shrink-0">
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-red-700">¿Necesitas ayuda?</h3>
              <p className="text-gray-600 text-sm">Si tienes dudas sobre el proceso de pago, comunícate con nosotros.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 border border-red-700 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition flex-shrink-0">
            <PhoneIcon className="w-5 h-5" />
            Contáctanos
          </button>
        </div>
      </main>

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
                  ${paymentData.valor.toLocaleString('es-CO')} COP
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
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
