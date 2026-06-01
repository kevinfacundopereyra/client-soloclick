// src/components/PaymentsHistoryPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paymentsService } from "../services/paymentsService";

import type {
  Payment,
  PaymentStats,
  ClientData,
} from "../services/paymentsService";

const PaymentsHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "today" | "week" | "month"
  >("all");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log("🔄 PaymentsHistoryPage: Iniciando carga...");

      const result = await paymentsService.getMyPayments();
      console.log(
        "🎯 PaymentsHistoryPage: Resultado completo recibido:",
        result
      );
      console.log("🎯 PaymentsHistoryPage: result.success:", result.success);
      console.log("🎯 PaymentsHistoryPage: result.payments:", result.payments);
      console.log(
        "🎯 PaymentsHistoryPage: result.payments.length:",
        result.payments?.length
      );
      console.log("🎯 PaymentsHistoryPage: result.stats:", result.stats);

      // ✅ VERIFICAR antes de setear el estado
      if (result && result.payments) {
        console.log(
          "✅ PaymentsHistoryPage: Datos válidos, actualizando estado..."
        );
        console.log("✅ PaymentsHistoryPage: Primer pago:", result.payments[0]);

        setPayments(result.payments);
        setStats(result.stats);

        console.log("✅ PaymentsHistoryPage: Estado actualizado");

        // ✅ VERIFICAR después de setear
        setTimeout(() => {
          console.log("🔍 PaymentsHistoryPage: Estado después del set:", {
            paymentsLength: result.payments.length,
            firstPayment: result.payments[0],
          });
        }, 100);
      } else {
        console.warn(
          "⚠️ PaymentsHistoryPage: Datos inválidos recibidos:",
          result
        );
      }
    } catch (error) {
      console.error("❌ PaymentsHistoryPage: Error cargando pagos:", error);
    } finally {
      setLoading(false);
      console.log("🏁 PaymentsHistoryPage: Carga completada");
    }
  };

  const getFilteredPayments = () => {
    console.log("🔍 getFilteredPayments: Iniciando filtrado...");
    console.log("🔍 getFilteredPayments: payments.length:", payments.length);
    console.log("🔍 getFilteredPayments: filter actual:", filter);

    if (payments.length === 0) {
      console.log("⚠️ getFilteredPayments: No hay pagos para filtrar");
      return [];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filtered = payments.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);

      console.log(`🔍 Filtrando pago ${payment._id}:`, {
        filter,
        paymentDate,
        status: payment.status,
      });

      switch (filter) {
        case "completed":
          return payment.status === "completed";
        case "pending":
          return payment.status === "pending";
        case "today":
          return paymentDate >= today;
        case "week":
          return paymentDate >= weekAgo;
        case "month":
          return paymentDate >= monthAgo;
        default:
          return true; // 'all'
      }
    });

    console.log("🎯 getFilteredPayments: Resultado filtrado:", {
      original: payments.length,
      filtered: filtered.length,
      filter,
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      case "refunded":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallido";
      case "refunded":
        return "Reembolsado";
      default:
        return status;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return "💵";
      case "card":
        return "💳";
      case "transfer":
        return "🏦";
      case "digital":
        return "📱";
      default:
        return "💰";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: any) => {
    try {
      // ✅ ARREGLAR: Manejar diferentes formatos de fecha
      let date: Date;

      if (!dateString) {
        return "Fecha no disponible";
      }

      // Si ya es un objeto Date
      if (dateString instanceof Date) {
        date = dateString;
      }
      // Si es un string de fecha
      else if (typeof dateString === "string") {
        // Remover caracteres especiales y normalizar
        const cleanDateString = dateString.replace(/[^\d-T:.Z]/g, "");
        date = new Date(cleanDateString);

        // Si no es válida, probar con Date.parse
        if (isNaN(date.getTime())) {
          date = new Date(Date.parse(dateString));
        }

        // Si sigue sin ser válida, usar fecha actual
        if (isNaN(date.getTime())) {
          console.warn("⚠️ Fecha inválida, usando fecha actual:", dateString);
          date = new Date();
        }
      }
      // Fallback
      else {
        date = new Date();
      }

      return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error(
        "❌ Error formateando fecha:",
        error,
        "Fecha original:",
        dateString
      );
      return "Fecha inválida";
    }
  };

  // ✅ NUEVO: Función para obtener el nombre del cliente de forma segura
  const getClientName = (
    clientId: string | ClientData | null,
    fallbackName: string
  ): string => {
    // Si clientId es un objeto con la propiedad 'name' (es decir, está poblado)
    if (typeof clientId === "object" && clientId && "name" in clientId) {
      return clientId.name;
    }
    // Si no, usamos el nombre de respaldo que viene en el pago
    return fallbackName || "Cliente Pendiente";
  };

  const filteredPayments = getFilteredPayments();

  console.log("🎨 PaymentsHistoryPage: Renderizando...", {
    loading,
    paymentsLength: payments.length,
    filteredLength: filteredPayments.length,
    statsExists: !!stats,
  });

  if (payments.length > 0) {
    console.log("🎨 PaymentsHistoryPage: Primer pago en render:", payments[0]);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 text-white text-lg">
        Cargando historial de pagos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 text-white">
        <button
          onClick={() => navigate("/profile")}
          className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base"
        >
          ← Volver al Perfil
        </button>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">💰 Historial de Pagos</h1>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/95 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-500">
                {formatCurrency(stats.thisMonth)}
              </div>
              <div className="text-gray-500 text-sm mt-2">Ingresos este mes</div>
            </div>

            <div className="bg-white/95 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-500">
                {stats.completedPayments}
              </div>
              <div className="text-gray-500 text-sm mt-2">Pagos completados</div>
            </div>

            <div className="bg-white/95 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-violet-500">
                {formatCurrency(stats.averageService)}
              </div>
              <div className="text-gray-500 text-sm mt-2">Promedio por servicio</div>
            </div>

            <div className="bg-white/95 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-500">
                {stats.pendingPayments}
              </div>
              <div className="text-gray-500 text-sm mt-2">Pagos pendientes</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/95 p-4 sm:p-6 rounded-xl mb-8 shadow-lg">
          <h3 className="mb-4 text-slate-800 font-semibold">🔍 Filtros</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            {[
              { key: "all", label: "Todos" },
              { key: "completed", label: "Completados" },
              { key: "pending", label: "Pendientes" },
              { key: "today", label: "Hoy" },
              { key: "week", label: "Esta semana" },
              { key: "month", label: "Este mes" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="text-gray-500 text-sm">
            Mostrando {filteredPayments.length} de {payments.length} pagos
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white/95 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200 font-bold text-slate-800">
            📋 Historial de Transacciones
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500">
              <div className="text-5xl mb-4">💸</div>
              <div>No hay pagos para mostrar con los filtros seleccionados</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-4">
                      <span className="text-2xl">
                        {getPaymentIcon(payment.paymentMethod)}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 text-base sm:text-lg">
                          {payment.serviceName}
                        </div>
                        <div className="text-gray-600 text-sm">
                          Cliente: {getClientName(payment.clientId, payment.clientName)}
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: getStatusColor(payment.status),
                        }}
                        className="text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                      <div>
                        <strong>Fecha del servicio:</strong>
                        <div>{formatDate(payment.serviceDate)}</div>
                      </div>
                      <div>
                        <strong>Fecha de pago:</strong>
                        <div>{formatDate(payment.paymentDate)}</div>
                      </div>
                      {payment.city && (
                        <div>
                          <strong>Ciudad:</strong>
                          <div>{payment.city}</div>
                        </div>
                      )}
                    </div>

                    {payment.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        💬 {payment.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right lg:border-l lg:border-gray-200 lg:pl-6">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-500 mb-1">
                      {formatCurrency(payment.netAmount)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Bruto: {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs sm:text-sm text-red-500">
                      Comisión: -{formatCurrency(payment.commission)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsHistoryPage;
