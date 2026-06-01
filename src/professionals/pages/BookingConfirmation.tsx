import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  appointmentsService,
  type CreateAppointmentData,
} from "../../services/appointmentsService";
import paymentsService from "../../services/paymentsService";
import useFeaturedPayments from "../../hooks/useFeaturedPayments";
import paymentMethodsService from "../../services/paymentMethodsService";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface Professional {
  id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  specialty: string;
  rating?: number;
  appointmentDuration: number;
}

interface BookingData {
  professional: Professional;
  services: Service[];
  date: string;
  time: string;
  totalPrice: number;
  totalDuration: number;
}

interface PaymentMethodForm {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { featuredPayments, paymentMethods } = useFeaturedPayments();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("mercadopago");
  const [notes, setNotes] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState<boolean>(false);
  const [paymentForm, setPaymentForm] = useState<PaymentMethodForm>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [savingPayment, setSavingPayment] = useState<boolean>(false);

  const handleSavePaymentMethod = async () => {
    if (!paymentForm.cardNumber || !paymentForm.cardholderName || !paymentForm.expiryDate || !paymentForm.cvv) {
      alert("Por favor completa todos los campos de la tarjeta");
      return;
    }

    if (paymentForm.cardNumber.length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos");
      return;
    }

    if (paymentForm.cvv.length !== 3) {
      alert("El CVV debe tener 3 dígitos");
      return;
    }

    setSavingPayment(true);
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        alert("Debes iniciar sesión para guardar un método de pago");
        setSavingPayment(false);
        return;
      }

      const userData = JSON.parse(user);
      const professionalId = userData.id || userData._id;

      if (!professionalId) {
        alert("No se encontró tu ID de profesional");
        setSavingPayment(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("No hay token de autenticación. Por favor inicia sesión nuevamente.");
        setSavingPayment(false);
        return;
      }

      const apiUrl = "http://localhost:3000"; // Usar puerto 3000 directamente
      const endpoint = `${apiUrl}/users/profile`;
      
      console.log("📤 Enviando solicitud de guardar método de pago:");
      console.log("URL:", endpoint);
      console.log("Datos:", { paymentMethods: [paymentForm] });

      // Enviar al backend para guardar el método de pago
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethods: [paymentForm],
        }),
      });

      console.log("📥 Estado de respuesta:", response.status, response.statusText);

      const responseData = await response.text();
      console.log("📥 Datos de respuesta:", responseData);

      if (!response.ok) {
        let errorMessage = "Error al guardar el método de pago";
        try {
          const errorJson = JSON.parse(responseData);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // Si no es JSON, usar el texto como está
          errorMessage = responseData || errorMessage;
        }
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      alert("✅ Método de pago guardado exitosamente");
      setPaymentForm({
        cardNumber: "",
        cardholderName: "",
        expiryDate: "",
        cvv: "",
      });
      setShowPaymentModal(false);
      setSavePaymentMethod(false);
    } catch (error: any) {
      console.error("❌ Error al guardar método de pago:", error);
      console.error("Detalles del error:", {
        message: error.message,
        stack: error.stack,
      });
      alert(`Error al guardar el método de pago: ${error.message}`);
    } finally {
      setSavingPayment(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem("bookingData");

    if (data) {
      setBookingData(JSON.parse(data));
    }
  }, []);

  // Si hay métodos destacados online, seleccionar el primero por defecto
  useEffect(() => {
    if (featuredPayments && featuredPayments.length > 0) {
      // Si el usuario no cambió el método (sigue siendo 'establishment'), usamos el primero destacado
      setPaymentMethod((prev) =>
        prev === "establishment" ? featuredPayments[0].id : prev
      );
    }
  }, [featuredPayments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + duration);
    return `${endTime.getHours().toString().padStart(2, "0")}:${endTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    if (!bookingData) return;
    console.log("🔍 Iniciando confirmación de reserva...");
    console.log("📋 Datos de reserva completos:", bookingData);
    try {
      // Crear la cita primero
      const appointmentData: CreateAppointmentData = {
        professionalId: getProfessionalId(),
        clientId: getCurrentUserId(),
        services: bookingData.services.map((service) => service.id),
        date: bookingData.date,
        time: bookingData.time,
        totalPrice: bookingData.totalPrice,
        totalDuration: bookingData.totalDuration,
        notes: notes.trim() || undefined,
      };
      console.log(
        "� Datos EXACTOS enviando al backend:",
        JSON.stringify(appointmentData, null, 2)
      );
      const response = await appointmentsService.createAppointment(
        appointmentData
      );
      console.log("� Respuesta del backend:", response);
      if (response.success) {
        // Si el método de pago es online, crear el pago y redirigir
        if (paymentMethod !== "establishment") {
          try {
            // Obtener IDs y coercionarlos a string/number explícitamente
            const appointmentId = String(
              response.appointment?._id || response.appointment?.id || ""
            );
            const professionalId = String(getProfessionalId());
            const clientId = String(getCurrentUserId());
            const amount = Number(bookingData.totalPrice);
            const netAmount = Number(amount);

            const paymentBody = {
              professionalId,
              appointmentId,
              clientId,
              amount,
              netAmount,
            } as const;

            console.log("📤 Enviando POST /payments con body:", paymentBody);

            const paymentResponse = await paymentsService.createPayment(
              paymentBody as any
            );
            console.log("📥 Respuesta de la API de pago:", paymentResponse);

            if (paymentResponse?.preference_url) {
              console.log("🔗 Abriendo URL de Mercado Pago:", paymentResponse.preference_url);
              window.open(paymentResponse.preference_url, '_blank');
              return; // redirigimos al checkout y detenemos flujo
            }

            alert("No se recibió la URL de pago");
          } catch (err) {
            console.error("Error al crear el pago:", err);
            const e: any = err;
            const msg =
              e?.message ||
              e?.response?.data?.message ||
              JSON.stringify(e?.response?.data) ||
              "Error al crear el pago";
            alert(msg);
            return;
          }
        }
        // Limpiar localStorage
        localStorage.removeItem("selectedServices");
        localStorage.removeItem("professionalData");
        localStorage.removeItem("bookingData");
        alert(
          `¡Reserva confirmada! 🎉\n\nDetalles:\n• Profesional: ${
            bookingData.professional.name
          }\n• Fecha: ${formatDate(bookingData.date)}\n• Hora: ${
            bookingData.time
          }\n• Total: $${bookingData.totalPrice}`
        );
        navigate("/mis-reservas");
      } else {
        console.error("❌ Error del backend:", response);
        alert(
          `Error al crear la reserva: ${
            response.message || "Error desconocido"
          }`
        );
      }
    } catch (error: any) {
      console.error("💥 Error critico:", error);
      console.error("💥 Error completo:", error);
      console.error("💥 Error response:", error.response);
      console.error("💥 Error response data:", error.response?.data);
      let errorMessage =
        "Error al crear la reserva. Por favor intenta nuevamente.";
      if (error.response?.status === 400) {
        errorMessage = "Datos de reserva inválidos. Verifica la información.";
      } else if (error.response?.status === 409) {
        errorMessage = "Ese horario ya fue reservado por otro cliente.";
      } else if (error.response?.status === 401) {
        errorMessage = "Debes iniciar sesión para realizar una reserva.";
      }
      alert(errorMessage);
    }
  };

  // ✅ MEJORAR - Función para obtener ID del profesional
  const getProfessionalId = (): string => {
    if (!bookingData?.professional) {
      throw new Error("No hay datos del profesional");
    }

    // ✅ CORREGIR - Buscar _id o id
    const professionalId =
      bookingData.professional.id || (bookingData.professional as any)._id;

    if (!professionalId) {
      console.error("❌ Professional data:", bookingData.professional);
      throw new Error("El profesional no tiene un ID válido");
    }

    console.log("🔍 ID del profesional para reserva:", professionalId);
    return professionalId;
  };

  // ✅ MEJORAR - Función para obtener ID del usuario desde localStorage
  const getCurrentUserId = (): string => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      const tempUserId = "670123456789abcdef012345";
      console.warn(
        "⚠️ No hay usuario logueado, usando id temporal:",
        tempUserId
      );
      return tempUserId;
    }
    try {
      const parsed = JSON.parse(raw);
      const id = parsed.id || parsed._id || parsed.userId || parsed._userId;
      if (!id) {
        const tempUserId = "670123456789abcdef012345";
        console.warn(
          "⚠️ El objeto user no contiene id, usando id temporal:",
          tempUserId
        );
        return tempUserId;
      }
      return String(id);
    } catch (e) {
      const tempUserId = "670123456789abcdef012345";
      console.warn(
        "⚠️ No se pudo parsear user en localStorage, usando id temporal:",
        tempUserId
      );
      return tempUserId;
    }
  };

  if (!bookingData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#4a5568" }}
        >
          No hay datos de reserva
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#667eea",
            border: "none",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() => navigate(`/reservar/horario/${id}`)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginRight: "1rem",
              color: "#4a5568",
            }}
          >
            ←
          </button>
          <div style={{ fontSize: "0.9rem", color: "#667eea" }}>
            Servicios &gt; Hora &gt; Confirmar
          </div>
          <button
            onClick={() => navigate(`/profesional/${id}`)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginLeft: "auto",
              color: "#4a5568",
            }}
          >
            ✕
          </button>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#2d3a4a",
            margin: 0,
          }}
        >
          Revisar y confirmar
        </h1>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "2rem",
        }}
      >
        {/* Main Content */}
        <div>
          {/* Payment Method */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#2d3a4a",
                marginBottom: "1rem",
              }}
            >
              Método de pago
            </h2>

            {/* Featured Payment Methods */}
            {paymentMethods.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#667eea",
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Métodos de pago online
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        border:
                          paymentMethod === method.id
                            ? "2px solid #667eea"
                            : "1px solid #e0e0e0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background:
                          paymentMethod === method.id ? "#f8f9ff" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border:
                            paymentMethod === method.id
                              ? "2px solid #667eea"
                              : "2px solid #ccc",
                          background:
                            paymentMethod === method.id ? "#667eea" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {paymentMethod === method.id && (
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "white",
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flex: 1,
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>
                          {paymentMethodsService.getPaymentIcon(method.type)}
                        </span>
                        <div>
                          <div
                            style={{
                              color: "#2d3a4a",
                              fontWeight: "500",
                              fontSize: "1rem",
                            }}
                          >
                            {method.name}
                          </div>
                          {method.isDefault && (
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "#667eea",
                                fontWeight: "500",
                              }}
                            >
                              Método por defecto
                            </div>
                          )}
                        </div>
                      </div>
                  {featuredPayments.some((fp) => fp.id === method.id) && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      ⭐ Destacado
                    </div>
                  )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Payment Method Section */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e0e0e0" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#2d3a4a",
                  marginBottom: "0.75rem",
                }}
              >
                Agregar un nuevo método de pago
              </h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px dashed #667eea",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#667eea",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#f8f9ff";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = "transparent";
                }}
              >
                + Agregar tarjeta de crédito
              </button>

              {/* Save Payment Method Checkbox */}
              {showPaymentModal && (
                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="savePaymentCheckbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                  <label
                    htmlFor="savePaymentCheckbox"
                    style={{
                      fontSize: "0.95rem",
                      color: "#4a5568",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Guardar este método de pago para futuras compras
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#2d3a4a",
                marginBottom: "0.5rem",
              }}
            >
              Política de cancelación
            </h2>
            <p
              style={{
                color: "#4a5568",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Cancela gratis en cualquier momento.
            </p>
          </div>

          {/* Booking Notes */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#2d3a4a",
                marginBottom: "1rem",
              }}
            >
              Notas de la reserva
            </h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Incluir comentarios o solicitudes a tu reserva"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: "1rem",
                color: "#2d3a4a",
              }}
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content",
            position: "sticky",
            top: "1rem",
          }}
        >
          {/* Professional Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginRight: "1rem",
              }}
            >
              {bookingData.professional.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "#2d3a4a" }}>
                {bookingData.professional.name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                Padre Vázquez 1440, {bookingData.professional.city}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <div>
              <div style={{ color: "#2d3a4a" }}>
                {formatDate(bookingData.date)}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                🕐 {bookingData.time}-
                {calculateEndTime(bookingData.time, bookingData.totalDuration)}{" "}
                ({bookingData.totalDuration} min de duración)
              </div>
            </div>
          </div>

          {/* Selected Services */}
          {bookingData.services.map((service) => (
            <div
              key={service.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div>
                <div style={{ fontWeight: "500", color: "#2d3a4a" }}>
                  {service.name}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                  {service.duration} min con cualquier profesional
                </div>
              </div>
              <div style={{ fontWeight: "600", color: "#2d3a4a" }}>
                {service.price} ARS
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
              color: "#4a5568",
            }}
          >
            <span>Subtotal</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#2d3a4a",
              marginBottom: "0.5rem",
            }}
          >
            <span>Total</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Payment Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.9rem",
              color: "#22c55e",
              fontWeight: "600",
              marginBottom: "1.5rem",
            }}
          >
            <span>Pagar ahora</span>
            <span>0 ARS</span>
          </div>



          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            style={{
              width: "100%",
              background: "#2d3a4a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#2d3a4a",
                  margin: 0,
                }}
              >
                Agregar tarjeta de crédito
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#4a5568",
                }}
              >
                ✕
              </button>
            </div>

            {/* Payment Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Card Number */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#2d3a4a",
                    marginBottom: "0.5rem",
                  }}
                >
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(paymentForm.cardNumber)}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                    setPaymentForm({
                      ...paymentForm,
                      cardNumber: cleaned,
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                  }}
                  maxLength={19}
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#2d3a4a",
                    marginBottom: "0.5rem",
                  }}
                >
                  Nombre del titular
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={paymentForm.cardholderName}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      cardholderName: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Expiry Date and CVV */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#2d3a4a",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Expiración
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={formatExpiryDate(paymentForm.expiryDate)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setPaymentForm({
                        ...paymentForm,
                        expiryDate: cleaned,
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                    maxLength={5}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#2d3a4a",
                      marginBottom: "0.5rem",
                    }}
                  >
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setPaymentForm({
                        ...paymentForm,
                        cvv: cleaned,
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Save Payment Method Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="savePaymentModal"
                  checked={savePaymentMethod}
                  onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="savePaymentModal"
                  style={{
                    fontSize: "0.95rem",
                    color: "#4a5568",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Guardar este método de pago
                </label>
              </div>

              {/* Info Text */}
              <div
                style={{
                  background: "#f0f4ff",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#4a5568",
                  marginTop: "0.5rem",
                }}
              >
                ℹ️ Esto es un ejemplo. No usaremos datos reales de tarjetas.
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    background: "white",
                    color: "#4a5568",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = "#f8f9fa";
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = "white";
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePaymentMethod}
                  disabled={savingPayment}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    background: savePaymentMethod ? "#667eea" : "#ccc",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: savePaymentMethod ? "pointer" : "not-allowed",
                    opacity: savingPayment ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (savePaymentMethod && !savingPayment) {
                      (e.target as HTMLButtonElement).style.background = "#5568d3";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (savePaymentMethod && !savingPayment) {
                      (e.target as HTMLButtonElement).style.background = "#667eea";
                    }
                  }}
                >
                  {savingPayment ? "Guardando..." : savePaymentMethod ? "Guardar" : "Usar sin guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
