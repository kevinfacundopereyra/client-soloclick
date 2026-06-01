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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-lg mb-4 text-gray-700">
          No hay datos de reserva
        </div>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg cursor-pointer transition"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/reservar/horario/${id}`)}
            className="text-2xl bg-none border-none cursor-pointer mr-4 text-gray-600 hover:text-gray-800"
          >
            ←
          </button>
          <div className="text-xs sm:text-sm text-indigo-500">
            Servicios &gt; Hora &gt; Confirmar
          </div>
          <button
            onClick={() => navigate(`/profesional/${id}`)}
            className="text-2xl bg-none border-none cursor-pointer ml-auto text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 m-0">
          Revisar y confirmar
        </h1>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Payment Method */}
          <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
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
                          flexDirection: "row",
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
                        fontSize: "0.7rem",
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
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
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
          <div className="bg-white rounded-lg p-4 sm:p-6">
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
        <div className="lg:col-span-1 bg-white rounded-lg p-4 sm:p-6 h-fit sticky top-4">
          {/* Professional Info */}
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mr-4 flex-shrink-0">
              {bookingData.professional.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 leading-tight">
                {bookingData.professional.name}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {bookingData.professional.city}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-start gap-2 mb-4 pb-4 border-b border-gray-100">
            <span className="text-lg flex-shrink-0">📅</span>
            <div className="min-w-0">
              <div className="text-gray-800">
                {formatDate(bookingData.date)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                🕐 {bookingData.time}-
                {calculateEndTime(bookingData.time, bookingData.totalDuration)}{" "}
                ({bookingData.totalDuration} min)
              </div>
            </div>
          </div>

          {/* Selected Services */}
          {bookingData.services.map((service) => (
            <div key={service.id} className="flex justify-between items-start gap-2 mb-4 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800">
                  {service.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {service.duration} min
                </div>
              </div>
              <div className="font-semibold text-gray-800 flex-shrink-0">
                {service.price} ARS
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-between items-center mb-2 text-gray-600">
            <span>Subtotal</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-800 mb-2">
            <span>Total</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Payment Info */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-green-600 font-semibold mb-4 sm:mb-6">
            <span>Pagar ahora</span>
            <span>0 ARS</span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-gray-800 text-white border-none rounded-lg p-3 sm:p-4 text-base font-semibold cursor-pointer hover:bg-gray-900 transition"
          >
            Confirmar
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">
                Agregar tarjeta de crédito
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-none border-none text-2xl cursor-pointer text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Payment Form */}
            <div className="flex flex-col gap-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-base font-mono"
                  maxLength={19}
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-base"
                />
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-mono"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-mono"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Save Payment Method Checkbox */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="savePaymentModal"
                  checked={savePaymentMethod}
                  onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <label
                  htmlFor="savePaymentModal"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Guardar este método de pago
                </label>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-gray-600 mt-2">
                ℹ️ Esto es un ejemplo. No usaremos datos reales de tarjetas.
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-600 text-base font-semibold cursor-pointer transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePaymentMethod}
                  disabled={savingPayment}
                  className={`py-2 px-4 border-none rounded-lg text-white text-base font-semibold transition ${
                    savePaymentMethod
                      ? "bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed"
                  } ${savingPayment ? "opacity-70" : ""}`}
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
