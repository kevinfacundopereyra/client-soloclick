// Crear archivo: src/professionals/pages/ProfessionalDashboard.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsService } from "../../services/appointmentsService";

interface Appointment {
  _id: string;
  client?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  clientId?: string;
  services: Array<string>;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  notes?: string;
  createdAt: string;
}

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"today" | "week" | "all">("today");

  useEffect(() => {
    loadProfessionalAppointments();
  }, []);

  const loadProfessionalAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Cargando citas del profesional...");
      
      // TODO: Crear este endpoint en el backend
      const response = await appointmentsService.getProfessionalAppointments();
      
      if (response.success) {
        setAppointments(response.appointments || []);
        console.log("✅ Citas del profesional cargadas:", response.appointments?.length);
      } else {
        setError("Error al cargar las citas");
      }
    } catch (err: any) {
      console.error("❌ Error cargando citas del profesional:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "#f59e0b", bg: "#fef3c7", text: "Pendiente", icon: "⏳" };
      case "confirmed":
        return { color: "#10b981", bg: "#d1fae5", text: "Confirmada", icon: "✅" };
      case "cancelled":
        return { color: "#ef4444", bg: "#fee2e2", text: "Cancelada", icon: "❌" };
      case "completed":
        return { color: "#6366f1", bg: "#e0e7ff", text: "Completada", icon: "🎉" };
      case "scheduled":
        return { color: "#8b5cf6", bg: "#ede9fe", text: "Programada", icon: "📅" };
      default:
        return { color: "#6b7280", bg: "#f3f4f6", text: status, icon: "❓" };
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      console.log(`🔍 Actualizando cita ${appointmentId} a ${newStatus}`);
      
      // TODO: Crear este endpoint en el backend
      const response = await appointmentsService.updateStatus(appointmentId, newStatus);
      
      if (response.success) {
        console.log("✅ Status actualizado exitosamente");
        loadProfessionalAppointments(); // Recargar citas
      } else {
        alert("Error al actualizar el status");
      }
    } catch (error) {
      console.error("❌ Error actualizando status:", error);
      alert("Error de conexión");
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.confirmAppointment(appointmentId);
      // Recargar citas o actualizar estado
      loadProfessionalAppointments();
    } catch (error) {
      console.error('Error confirmando cita:', error);
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.completeAppointment(appointmentId);
      // Recargar citas o actualizar estado
      loadProfessionalAppointments();
    } catch (error) {
      console.error('Error completando cita:', error);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "today") {
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);
      return appointmentDay.getTime() === today.getTime();
    }

    if (filter === "week") {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      return appointmentDate >= today && appointmentDate <= weekFromNow;
    }

    return true; // "all"
  });

  // Estadísticas básicas
  const todayAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  }).length;

  const weeklyEarnings = filteredAppointments
    .filter(apt => apt.status === "completed")
    .reduce((total, apt) => total + apt.totalPrice, 0);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ color: "white", fontSize: "1.2rem", textAlign: "center" }}>
          Cargando tu agenda...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      padding: "2rem 0",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem"
        }}>
          <div>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              ← Volver
            </button>

            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              margin: "0",
              color: "white"
            }}>
              Mi Agenda
            </h1>

            <p style={{
              color: "rgba(255, 255, 255, 0.8)",
              margin: "0.5rem 0 0 0",
              fontSize: "1.1rem"
            }}>
              {appointments.length} citas en total • {todayAppointments} hoy
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/profile/stats")}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              📊 Mis Estadísticas
            </button>
            <button
              onClick={() => navigate("/profile")}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              👤 Mi Perfil
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#10b981", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
              📅 Citas de Hoy
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
              {todayAppointments}
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#10b981", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
              💰 Ingresos (Semana)
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
              ${weeklyEarnings.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#10b981", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
              📊 Total Citas
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
              {appointments.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { key: "today", label: "Hoy", count: todayAppointments },
            { key: "week", label: "Esta Semana", count: filteredAppointments.length },
            { key: "all", label: "Todas", count: appointments.length }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              style={{
                background: filter === filterOption.key ? "white" : "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: filter === filterOption.key ? "#10b981" : "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            marginBottom: "2rem"
          }}>
            <h3 style={{ color: "white", margin: "0 0 1rem 0" }}>
              Error al cargar las citas
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: "0 0 1.5rem 0" }}>
              {error}
            </p>
            <button
              onClick={loadProfessionalAppointments}
              style={{
                background: "rgba(239, 68, 68, 0.8)",
                border: "none",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "25px",
                cursor: "pointer"
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredAppointments.length === 0 && (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "4rem 2rem",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📅</div>
            <h3 style={{ color: "#2d3748", margin: "0 0 1rem 0", fontSize: "1.5rem" }}>
              {filter === "today" ? "No tienes citas hoy" :
               filter === "week" ? "No tienes citas esta semana" :
               "No tienes citas programadas"}
            </h3>
            <p style={{ color: "#4a5568", margin: "0", fontSize: "1.1rem" }}>
              Las citas que reserven contigo aparecerán aquí
            </p>
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length > 0 && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {filteredAppointments.map((appointment) => {
              const statusInfo = getStatusInfo(appointment.status);
              const clientName = typeof appointment.client === "object" 
                ? appointment.client?.name 
                : "Cliente no disponible";

              return (
                <div
                  key={appointment._id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    padding: "1.5rem 2rem",
                    color: "white"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}>
                      <div>
                        <h3 style={{
                          margin: "0 0 0.5rem 0",
                          fontSize: "1.4rem",
                          fontWeight: "bold"
                        }}>
                          {clientName}
                        </h3>
                        <p style={{ margin: "0", opacity: 0.9, fontSize: "1rem" }}>
                          📅 {formatDate(appointment.date)} • ⏰ {appointment.time}
                        </p>
                      </div>
                      
                      <div style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "600"
                      }}>
                        {statusInfo.icon} {statusInfo.text}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "2rem" }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1.5rem",
                      marginBottom: "2rem"
                    }}>
                      
                      {/* Cliente Info */}
                      <div>
                        <h4 style={{
                          color: "#2d3748",
                          margin: "0 0 0.75rem 0",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}>
                          👤 Cliente
                        </h4>
                        <div style={{
                          background: "#f8f9fa",
                          padding: "1rem",
                          borderRadius: "8px"
                        }}>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                            {clientName}
                          </div>
                          {typeof appointment.client === "object" && appointment.client?.email && (
                            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                              📧 {appointment.client.email}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Precio */}
                      <div>
                        <h4 style={{
                          color: "#2d3748",
                          margin: "0 0 0.75rem 0",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}>
                          💰 Total
                        </h4>
                        <div style={{
                          background: "#f8f9fa",
                          padding: "1rem",
                          borderRadius: "8px"
                        }}>
                          <div style={{
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: "#10b981"
                          }}>
                            ${appointment.totalPrice?.toLocaleString() || "0"}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                            {appointment.totalDuration} minutos
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div style={{ marginBottom: "2rem" }}>
                        <h4 style={{
                          color: "#2d3748",
                          margin: "0 0 0.5rem 0",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}>
                          📝 Notas
                        </h4>
                        <p style={{
                          background: "#fef3c7",
                          padding: "1rem",
                          borderRadius: "8px",
                          margin: "0",
                          color: "#92400e"
                        }}>
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: "flex",
                      gap: "1rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid #e5e7eb",
                      flexWrap: "wrap"
                    }}>
                      {/* ✅ CAMBIAR: Agregar "pending" para mostrar botón Confirmar */}
                      {(appointment.status === "scheduled" || appointment.status === "pending") && (
                        <button
                          onClick={() => confirmAppointment(appointment._id)}
                          style={{
                            background: "#10b981",
                            border: "none",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "500"
                          }}
                        >
                          ✅ Confirmar
                        </button>
                      )}

                      {/* ✅ CAMBIAR: Agregar "pending" para mostrar botón Completar */}
                      {(appointment.status === "confirmed" || 
                        appointment.status === "scheduled" || 
                        appointment.status === "pending") && (
                        <button
                          onClick={() => completeAppointment(appointment._id)}
                          style={{
                            background: "#6366f1",
                            border: "none",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "500"
                          }}
                        >
                          🎉 Completar
                        </button>
                      )}

                      {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                          style={{
                            background: "transparent",
                            border: "2px solid #ef4444",
                            color: "#ef4444",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "500"
                          }}
                        >
                          ❌ Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;