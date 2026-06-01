import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsService } from "../../services/appointmentsService";

interface Appointment {
  _id: string;
  professional?:
    | string
    | {
        _id: string;
        name: string;
        specialty: string;
        city?: string;
      };
  professionalId?: string;
  services:
    | Array<string>
    | Array<{
        _id: string;
        name: string;
        price: number;
        duration: number;
      }>;
  date: string;
  time: string; // ✅ AHORA SÍ estará en BD (required: true)
  status: string;
  totalPrice: number;
  totalDuration?: number;
  notes?: string;
  createdAt: string;
}

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const loadMyAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Cargando citas del cliente...");
      const response = await appointmentsService.getMyAppointments();

      console.log("📥 Respuesta completa del backend:", response);

      if (response.success) {
        const rawAppointments = response.appointments || [];
        console.log("🔍 Citas recibidas:", rawAppointments.length);

        // ✅ MEJORAR - Filtrar solo citas válidas con tiempo
        const validAppointments = rawAppointments.filter(
          (apt: any) => apt && apt._id && apt.date && apt.time // ✅ Ahora SÍ requerimos time
        );

        setAppointments(validAppointments);
        console.log("✅ Citas válidas establecidas:", validAppointments.length);

        // ✅ AGREGAR - Debug de cada cita con manejo seguro de propiedades
        validAppointments.forEach((apt: Appointment, index: number) => {
          try {
            console.log(`--- Cita ${index + 1} ---`);
            console.log("ID:", apt._id || 'N/D');
            console.log("Date:", apt.date || 'N/D');
            console.log("Time:", apt.time || 'N/D');
            console.log("CreatedAt:", apt.createdAt || 'N/D');
            console.log("Status:", apt.status || 'N/D');
            console.log("Professional:", typeof apt.professional === 'object' ? 
              JSON.stringify(apt.professional, null, 2) : 
              (apt.professional || 'N/D'));
            console.log("Total Price:", apt.totalPrice || 0);
            console.log("Total Duration:", apt.totalDuration || 'N/D');
            console.log("--------------------");
          } catch (error) {
            console.error(`Error al mostrar detalles de la cita ${index + 1}:`, error);
          }
        });
      } else {
        console.log("❌ Response no exitosa:", response);
        setError("Error al cargar las citas");
      }
    } catch (err: any) {
      console.error("❌ Error cargando citas:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Fecha no disponible";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  // ✅ AGREGAR - Función para calcular hora de fin
  const calculateEndTime = (startTime: string, duration: number) => {
    try {
      if (!startTime || !duration) return startTime;

      const [hours, minutes] = startTime.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + duration);

      return `${endTime.getHours().toString().padStart(2, "0")}:${endTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      return startTime;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "#f59e0b",
          bg: "#fef3c7",
          text: "Pendiente",
          icon: "⏳",
        };
      case "confirmed":
        return {
          color: "#10b981",
          bg: "#d1fae5",
          text: "Confirmada",
          icon: "✅",
        };
      case "cancelled":
        return {
          color: "#ef4444",
          bg: "#fee2e2",
          text: "Cancelada",
          icon: "❌",
        };
      case "completed":
        return {
          color: "#6366f1",
          bg: "#e0e7ff",
          text: "Completada",
          icon: "🎉",
        };
      case "scheduled":
        return {
          color: "#8b5cf6",
          bg: "#ede9fe",
          text: "Programada",
          icon: "📅",
        };
      default:
        return {
          color: "#6b7280",
          bg: "#f3f4f6",
          text: status || "Desconocido",
          icon: "❓",
        };
    }
  };

  // ✅ ARREGLAR - Función isUpcoming con timezone local correcto
  const isUpcoming = (date: string, time: string) => {
    try {
      console.log("🔍 Checking if upcoming:", { date, time });

      // ✅ CAMBIAR - Usar zona horaria local
      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);

      // ✅ IMPORTANTE - Establecer la fecha en hora local
      const appointmentDateTime = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        hours,
        minutes
      );

      const now = new Date();

      const isUp = appointmentDateTime > now;

      console.log("🔍 Appointment datetime (local):", appointmentDateTime);
      console.log("🔍 Current datetime:", now);
      console.log("🔍 Is upcoming?", isUp);

      return isUp;
    } catch (error) {
      console.error("❌ Error in isUpcoming:", error);
      return false;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres cancelar esta cita?"
    );

    if (confirmed) {
      try {
        console.log("🔍 Cancelando cita:", appointmentId);
        const response = await appointmentsService.cancelAppointment(
          appointmentId
        );

        if (response.success) {
          console.log("✅ Cita cancelada exitosamente");
          alert("Cita cancelada exitosamente");
          loadMyAppointments();
        } else {
          alert("Error al cancelar la cita");
        }
      } catch (error) {
        console.error("❌ Error cancelando cita:", error);
        alert("Error de conexión al cancelar");
      }
    }
  };

  // ✅ MEJORAR - Filtrado con fecha Y hora
  const filteredAppointments = appointments.filter((appointment) => {
    try {
      if (
        !appointment ||
        !appointment._id ||
        !appointment.date ||
        !appointment.time
      ) {
        return false;
      }

      if (filter === "all") {
        return true;
      }

      if (filter === "upcoming") {
        return (
          isUpcoming(appointment.date, appointment.time) &&
          appointment.status !== "cancelled"
        );
      }

      if (filter === "past") {
        return (
          !isUpcoming(appointment.date, appointment.time) ||
          appointment.status === "completed"
        );
      }

      return true;
    } catch (error) {
      console.error("Error filtrando cita:", error);
      return false;
    }
  });

  console.log("🔍 Appointments totales:", appointments.length);
  console.log("🔍 Filtered appointments:", filteredAppointments.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center px-4">
        <div className="text-white text-base sm:text-lg text-center">
          Cargando tus citas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="w-full">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-3 sm:px-4 py-2 rounded text-sm font-medium mb-3 sm:mb-4 transition"
            >
              ← Volver
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Mis Reservas
            </h1>

            <p className="text-white/80 text-sm sm:text-base">
              {appointments.length} citas en total
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transition"
          >
            + Nueva Reserva
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { key: "all", label: "Todas", count: appointments.length },
            {
              key: "upcoming",
              label: "Próximas",
              count: appointments.filter(
                (a) => isUpcoming(a.date, a.time) && a.status !== "cancelled"
              ).length,
            },
            {
              key: "past",
              label: "Pasadas",
              count: appointments.filter(
                (a) => !isUpcoming(a.date, a.time) || a.status === "completed"
              ).length,
            },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition ${
                filter === filterOption.key
                  ? "bg-white text-purple-600"
                  : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 sm:px-6 py-6 sm:py-8 text-center mb-6 sm:mb-8">
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              Error al cargar las citas
            </h3>
            <p className="text-white/80 text-sm sm:text-base mb-4">
              {error}
            </p>
            <button
              onClick={loadMyAppointments}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredAppointments.length === 0 && (
          <div className="bg-white rounded-3xl px-6 sm:px-8 py-12 sm:py-16 text-center shadow-xl">
            <div className="text-4xl sm:text-5xl mb-4">📅</div>
            <h3 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-2 sm:mb-4">
              {filter === "all"
                ? "No tienes citas reservadas"
                : filter === "upcoming"
                ? "No tienes citas próximas"
                : "No tienes citas pasadas"}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
              {filter === "all"
                ? "Comienza reservando tu primera cita con nuestros profesionales"
                : filter === "upcoming"
                ? "Reserva una nueva cita para ver tus próximas citas aquí"
                : "Aquí aparecerán las citas que hayas completado"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition"
            >
              {filter === "all" ? "Reservar Primera Cita" : "Nueva Reserva"}
            </button>
          </div>
        )}

        {/* ✅ MEJORAR - Lista de citas CON tiempo obligatorio */}
        {filteredAppointments.length > 0 && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {filteredAppointments.map((appointment) => {
              try {
                const statusInfo = getStatusInfo(appointment.status);
                const upcoming = isUpcoming(appointment.date, appointment.time);

                // ✅ MEJORAR - Obtención más robusta del nombre del profesional
                const professionalName = (() => {
                  if (
                    typeof appointment.professional === "object" &&
                    appointment.professional?.name
                  ) {
                    return appointment.professional.name;
                  }
                  if (typeof appointment.professional === "string") {
                    return `Profesional ID: ${appointment.professional.substring(
                      0,
                      8
                    )}...`;
                  }
                  console.log(
                    "🔍 Professional data:",
                    appointment.professional
                  );
                  return "Profesional no disponible";
                })();

                const professionalId = (() => {
                  if (
                    typeof appointment.professional === "object" &&
                    appointment.professional?._id
                  ) {
                    return appointment.professional._id;
                  }
                  if (typeof appointment.professional === "string") {
                    return appointment.professional;
                  }
                  if (appointment.professionalId) {
                    return appointment.professionalId;
                  }
                  console.log("🔍 No professional ID found:", appointment);
                  return null;
                })();

                const endTime = calculateEndTime(
                  appointment.time,
                  appointment.totalDuration || 45
                );

                return (
                  <div
                    key={appointment._id}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.2s",
                    }}
                  >
                    {/* Header colorido */}
                    <div
                      style={{
                        background:
                          upcoming && appointment.status !== "cancelled"
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                        padding: "1.5rem 2rem",
                        color: "white",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: "0 0 0.5rem 0",
                              fontSize: "1.4rem",
                              fontWeight: "bold",
                            }}
                          >
                            {professionalName}
                          </h3>
                          <p
                            style={{
                              margin: "0",
                              opacity: 0.9,
                              fontSize: "1rem",
                            }}
                          >
                            📅 {formatDate(appointment.date)}
                          </p>
                        </div>

                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                          }}
                        >
                          {statusInfo.icon} {statusInfo.text}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "2rem" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "1.5rem",
                          marginBottom: "2rem",
                        }}
                      >
                        {/* Horario */}
                        <div>
                          <h4
                            style={{
                              color: "#2d3748",
                              margin: "0 0 0.75rem 0",
                              fontSize: "1rem",
                              fontWeight: "600",
                            }}
                          >
                            🕐 Horario
                          </h4>
                          <div
                            style={{
                              background: "#f8f9fa",
                              padding: "1rem",
                              borderRadius: "8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                color: "#2d3748",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {appointment.time} - {endTime}
                            </div>
                            <div
                              style={{
                                fontSize: "0.9rem",
                                color: "#6b7280",
                              }}
                            >
                              Duración: {appointment.totalDuration || 45}{" "}
                              minutos
                            </div>
                          </div>
                        </div>

                        {/* Estado */}
                        <div>
                          <h4
                            style={{
                              color: "#2d3748",
                              margin: "0 0 0.75rem 0",
                              fontSize: "1rem",
                              fontWeight: "600",
                            }}
                          >
                            📊 Estado
                          </h4>
                          <div
                            style={{
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              padding: "1rem",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "1rem",
                            }}
                          >
                            {statusInfo.icon} {statusInfo.text}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "1.5rem",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "1.3rem",
                              fontWeight: "bold",
                              color: "#2d3748",
                            }}
                          >
                            Total: $
                            {appointment.totalPrice?.toLocaleString() || "0"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#6b7280",
                            }}
                          >
                            {/* ✅ ARREGLAR - Manejo seguro de createdAt */}
                            Reservado el{" "}
                            {(() => {
                              if (!appointment.createdAt)
                                return "Fecha no disponible";

                              try {
                                const createdDate = new Date(
                                  appointment.createdAt
                                );
                                if (isNaN(createdDate.getTime()))
                                  return "Fecha no disponible";

                                return createdDate.toLocaleDateString("es-ES");
                              } catch (error) {
                                console.error(
                                  "Error formateando createdAt:",
                                  error
                                );
                                return "Fecha no disponible";
                              }
                            })()}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          {/* ✅ CAMBIAR - Condición más simple para mostrar cancelar */}
                          {appointment.status !== "cancelled" &&
                            appointment.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleCancelAppointment(appointment._id)
                                }
                                style={{
                                  background: "transparent",
                                  border: "2px solid #ef4444",
                                  color: "#ef4444",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "0.9rem",
                                  fontWeight: "500",
                                }}
                              >
                                Cancelar Cita
                              </button>
                            )}

                          {/* ✅ MEJORAR - Botón Ver Profesional más robusto */}
                          <button
                            onClick={() => {
                              if (professionalId) {
                                navigate(`/profesional/${professionalId}`);
                              } else {
                                console.log(
                                  "Professional ID no disponible para:",
                                  appointment.professional
                                );
                                alert(
                                  "Información del profesional no disponible"
                                );
                              }
                            }}
                            style={{
                              background: professionalId
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : "#9ca3af",
                              border: "none",
                              color: "white",
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              cursor: professionalId
                                ? "pointer"
                                : "not-allowed",
                              fontSize: "0.9rem",
                              fontWeight: "500",
                            }}
                          >
                            {professionalId
                              ? "Ver Profesional"
                              : "Profesional N/D"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error("Error renderizando cita:", error);
                return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
