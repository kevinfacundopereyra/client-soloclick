import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentsService, type CreateAppointmentData } from "../../services/appointmentsService";
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

const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { featuredPayments } = useFeaturedPayments();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("establishment");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem('bookingData');
    
    if (data) {
      setBookingData(JSON.parse(data));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + duration);
    return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!bookingData) return;
    
    console.log('🔍 Iniciando confirmación de reserva...');
    console.log('📋 Datos de reserva completos:', bookingData);
    
    try {
      // ✅ CORREGIR - Usar la interface correcta del appointmentsService
      const appointmentData: CreateAppointmentData = {
        professionalId: getProfessionalId(),
        clientId: getCurrentUserId(), // ✅ clientId en lugar de userId
        services: bookingData.services.map(service => service.id), // ✅ Solo IDs como strings
        date: bookingData.date,
        time: bookingData.time, // ✅ time en lugar de startTime
        totalPrice: bookingData.totalPrice,
        totalDuration: bookingData.totalDuration,
        notes: notes.trim() || undefined
      };
      
      // ✅ AGREGAR - Logs específicos para debug
      console.log('🔍 appointmentData.time:', appointmentData.time);
      console.log('🔍 typeof appointmentData.time:', typeof appointmentData.time);
      console.log('🔍 bookingData.time:', bookingData.time);
      console.log('📤 Datos EXACTOS enviando al backend:', JSON.stringify(appointmentData, null, 2));
      
      // Enviar al backend
      const response = await appointmentsService.createAppointment(appointmentData);
      
      console.log('📥 Respuesta del backend:', response);
      
      if (response.success) {
        console.log('✅ Reserva creada exitosamente');
        
        // Limpiar localStorage
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('professionalData');
        localStorage.removeItem('bookingData');
        
        // ✅ MEJORAR - Mensaje más profesional
        alert(`¡Reserva confirmada! 🎉\n\nDetalles:\n• Profesional: ${bookingData.professional.name}\n• Fecha: ${formatDate(bookingData.date)}\n• Hora: ${bookingData.time}\n• Total: $${bookingData.totalPrice}`);
        
        // ✅ OPCIONAL - Redirigir a página de confirmación personalizada
        navigate('/mis-reservas'); // O crear página /reserva-confirmada/:id
      } else {
        console.error('❌ Error del backend:', response);
        alert(`Error al crear la reserva: ${response.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('💥 Error critico:', error);
      console.error('💥 Error completo:', error);
      console.error('💥 Error response:', error.response);
      console.error('💥 Error response data:', error.response?.data);
      
      // ✅ MEJORAR - Mensaje de error más específico
      let errorMessage = 'Error al crear la reserva. Por favor intenta nuevamente.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Datos de reserva inválidos. Verifica la información.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Ese horario ya fue reservado por otro cliente.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Debes iniciar sesión para realizar una reserva.';
      }
      
      alert(errorMessage);
    }
  };

  // ✅ MEJORAR - Función para obtener ID del profesional
  const getProfessionalId = (): string => {
    if (!bookingData?.professional) {
      throw new Error('No hay datos del profesional');
    }
    
    // ✅ CORREGIR - Buscar _id o id
    const professionalId = bookingData.professional.id || (bookingData.professional as any)._id;
    
    if (!professionalId) {
      console.error('❌ Professional data:', bookingData.professional);
      throw new Error('El profesional no tiene un ID válido');
    }
    
    console.log('🔍 ID del profesional para reserva:', professionalId);
    return professionalId;
  };

  // ✅ MEJORAR - Función para obtener ID del usuario
  const getCurrentUserId = (): string => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        if (userId) {
          console.log('🔍 Usuario logueado con ID:', userId);
          return userId;
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
    
    // ✅ MEJORAR - En producción, requerir login
    console.warn('⚠️ No hay usuario logueado');
    
    // Para testing, generar ID temporal válido
    const tempUserId = '670123456789abcdef012345'; // ObjectId válido para testing
    console.log('🧪 Usando ID temporal para testing:', tempUserId);
    return tempUserId;
  };

  if (!bookingData) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "#f8f9fa"
      }}>
        <div style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#4a5568" }}>
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
            cursor: "pointer"
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#f8f9fa",
      padding: "1rem"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        marginBottom: "2rem"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "1rem"
        }}>
          <button
            onClick={() => navigate(`/reservar/horario/${id}`)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginRight: "1rem",
              color: "#4a5568"
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
              color: "#4a5568"
            }}
          >
            ✕
          </button>
        </div>
        
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: "#2d3a4a",
          margin: 0 
        }}>
          Revisar y confirmar
        </h1>
      </div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "2rem"
      }}>
        {/* Main Content */}
        <div>
          {/* Payment Method */}
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ 
              fontSize: "1.3rem", 
              fontWeight: "600", 
              color: "#2d3a4a",
              marginBottom: "1rem" 
            }}>
              Método de pago
            </h2>

            {/* Featured Payment Methods */}
            {featuredPayments.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#667eea",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  ⭐ Métodos destacados
                </h3>
                <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                  {featuredPayments.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        border: paymentMethod === method.id ? "2px solid #667eea" : "1px solid #e0e0e0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: paymentMethod === method.id ? "#f8f9ff" : "white",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: paymentMethod === method.id ? "2px solid #667eea" : "2px solid #ccc",
                        background: paymentMethod === method.id ? "#667eea" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {paymentMethod === method.id && (
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "white"
                          }} />
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        <span style={{ fontSize: "1.2rem" }}>
                          {paymentMethodsService.getPaymentIcon(method.type)}
                        </span>
                        <div>
                          <div style={{ 
                            color: "#2d3a4a", 
                            fontWeight: "500",
                            fontSize: "1rem"
                          }}>
                            {method.name}
                          </div>
                          {method.isDefault && (
                            <div style={{ 
                              fontSize: "0.8rem", 
                              color: "#667eea",
                              fontWeight: "500"
                            }}>
                              Método por defecto
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "500"
                      }}>
                        ⭐ Destacado
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div
              onClick={() => setPaymentMethod("establishment")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                border: paymentMethod === "establishment" ? "2px solid #667eea" : "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                background: paymentMethod === "establishment" ? "#f8f9ff" : "white"
              }}
            >
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: paymentMethod === "establishment" ? "2px solid #667eea" : "2px solid #ccc",
                background: paymentMethod === "establishment" ? "#667eea" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {paymentMethod === "establishment" && (
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "white"
                  }} />
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🏪</span>
                <span style={{ color: "#2d3a4a", fontWeight: "500" }}>
                  Pagar in el establecimiento
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ 
              fontSize: "1.3rem", 
              fontWeight: "600", 
              color: "#2d3a4a",
              marginBottom: "0.5rem" 
            }}>
              Política de cancelación
            </h2>
            <p style={{ 
              color: "#4a5568", 
              margin: 0,
              lineHeight: "1.5"
            }}>
              Cancela gratis en cualquier momento.
            </p>
          </div>

          {/* Booking Notes */}
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "1.5rem"
          }}>
            <h2 style={{ 
              fontSize: "1.3rem", 
              fontWeight: "600", 
              color: "#2d3a4a",
              marginBottom: "1rem" 
            }}>
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
                color: "#2d3a4a"
              }}
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          height: "fit-content",
          position: "sticky",
          top: "1rem"
        }}>
          {/* Professional Info */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            <div style={{
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
              marginRight: "1rem"
            }}>
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
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #f0f0f0"
          }}>
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <div>
              <div style={{ color: "#2d3a4a" }}>
                {formatDate(bookingData.date)}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                🕐 {bookingData.time}-{calculateEndTime(bookingData.time, bookingData.totalDuration)} ({bookingData.totalDuration} min de duración)
              </div>
            </div>
          </div>

          {/* Selected Services */}
          {bookingData.services.map((service) => (
            <div key={service.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #f0f0f0"
            }}>
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
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            color: "#4a5568"
          }}>
            <span>Subtotal</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Total */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#2d3a4a",
            marginBottom: "0.5rem"
          }}>
            <span>Total</span>
            <span>{bookingData.totalPrice} ARS</span>
          </div>

          {/* Payment Info */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.9rem",
            color: "#22c55e",
            fontWeight: "600",
            marginBottom: "1.5rem"
          }}>
            <span>Pagar ahora</span>
            <span>0 ARS</span>
          </div>

          <div style={{
            fontSize: "0.9rem",
            color: "#4a5568",
            marginBottom: "1.5rem",
            lineHeight: "1.4"
          }}>
            Pagar en el establecimiento: {bookingData.totalPrice} ARS
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
              cursor: "pointer"
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;