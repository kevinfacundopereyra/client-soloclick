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

  const formatDate = (dateString: string) => {
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        Cargando historial de pagos...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          color: "white",
        }}
      >
        <button
          onClick={() => navigate("/profile")}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          ← Volver al Perfil
        </button>
        <h1 style={{ color: "white", margin: 0 }}>💰 Historial de Pagos</h1>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(stats.thisMonth)}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Ingresos este mes
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "#f59e0b",
                  fontWeight: "bold",
                }}
              >
                {stats.completedPayments}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Pagos completados
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(stats.averageService)}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Promedio por servicio
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "#ef4444",
                  fontWeight: "bold",
                }}
              >
                {stats.pendingPayments}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Pagos pendientes
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>🔍 Filtros</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
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
                style={{
                  background: filter === key ? "#667eea" : "transparent",
                  color: filter === key ? "white" : "#4a5568",
                  border: `1px solid ${filter === key ? "#667eea" : "#d1d5db"}`,
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            Mostrando {filteredPayments.length} de {payments.length} pagos
          </div>
        </div>

        {/* Payments List */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid #e9ecef",
              fontWeight: "bold",
              color: "#2d3748",
            }}
          >
            📋 Historial de Transacciones
          </div>

          {filteredPayments.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💸</div>
              <div>No hay pagos para mostrar con los filtros seleccionados</div>
            </div>
          ) : (
            <div>
              {filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid #f1f5f9",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {getPaymentIcon(payment.paymentMethod)}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#2d3748",
                            fontSize: "1.1rem",
                          }}
                        >
                          {payment.serviceName}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                          Cliente:{" "}
                          {getClientName(payment.clientId, payment.clientName)}
                        </div>
                      </div>
                      <span
                        style={{
                          background: getStatusColor(payment.status),
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}
                    >
                      <div>
                        <strong>Fecha del servicio:</strong>
                        <br />
                        {formatDate(payment.serviceDate)}
                      </div>
                      <div>
                        <strong>Fecha de pago:</strong>
                        <br />
                        {formatDate(payment.paymentDate)}
                      </div>
                      {payment.city && (
                        <div>
                          <strong>Ciudad:</strong>
                          <br />
                          {payment.city}
                        </div>
                      )}
                    </div>

                    {payment.notes && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem",
                          background: "#f8f9fa",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          color: "#6b7280",
                        }}
                      >
                        💬 {payment.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        color: "#10b981",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {formatCurrency(payment.netAmount)}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Bruto: {formatCurrency(payment.amount)}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#ef4444" }}>
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
