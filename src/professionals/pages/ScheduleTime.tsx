import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentsService, type AvailableSlot } from "../../services/appointmentsService";

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

const ScheduleTime: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const servicesData = localStorage.getItem('selectedServices');
    const professionalData = localStorage.getItem('professionalData');
    
    if (servicesData) {
      setSelectedServices(JSON.parse(servicesData));
    }
    
    if (professionalData) {
      const prof = JSON.parse(professionalData);
      setProfessional(prof);
      
      // Set default date to today
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      setSelectedDate(todayString);
      
      // Load available slots for today - solo si tenemos el professional
      if (prof?.id) {
        loadAvailableSlots(prof.id, todayString);
      }
    }
  }, []); // ← Cambiar a array vacío para que solo se ejecute una vez

  // Función para cargar horarios disponibles
  const loadAvailableSlots = async (professionalId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const response = await appointmentsService.getAvailableSlots(professionalId, date);
      if (response.success && response.slots) {
        setAvailableSlots(response.slots);
      } else {
        // Si el backend no está disponible, usar slots mock
        setAvailableSlots(generateMockAvailableSlots());
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      // Usar slots mock como fallback
      setAvailableSlots(generateMockAvailableSlots());
    } finally {
      setLoadingSlots(false);
    }
  };

  // Generar slots mock para testing
  const generateMockAvailableSlots = (): AvailableSlot[] => {
    const slots: AvailableSlot[] = [];
    for (let hour = 12; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Simular algunos horarios ocupados
        const isOccupied = Math.random() < 0.3; // 30% de probabilidad de estar ocupado
        slots.push({
          time: timeString,
          available: !isOccupied
        });
      }
    }
    return slots;
  };

  // Función actualizada para manejar el cambio de fecha
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedTime(""); // Reset selected time
    if (professional?.id) {
      loadAvailableSlots(professional.id, newDate);
    }
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    // Generate next 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date: Date) => {
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return days[date.getDay()];
  };

  const getMonthName = (date: Date) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[date.getMonth()];
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.price), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.duration), 0);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert("Por favor selecciona fecha y hora");
      return;
    }
    
    // Store booking data
    const bookingData = {
      professional,
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      totalPrice: getTotalPrice(),
      totalDuration: getTotalDuration()
    };
    
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate(`/reservar/confirmar/${id}`);
  };

  if (!professional || selectedServices.length === 0) {
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

  const calendarDays = generateCalendarDays();

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
            onClick={() => navigate(`/reservar/servicios/${id}`)}
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
          Seleccionar hora
        </h1>
      </div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "2rem"
      }}>
        {/* Calendar and Time Selection */}
        <div>
          {/* Month Navigation */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div style={{ fontSize: "1.5rem" }}>📅</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3a4a" }}>
                {getMonthName(currentMonth)} de {currentMonth.getFullYear()}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const prevMonth = new Date(currentMonth);
                  prevMonth.setMonth(currentMonth.getMonth() - 1);
                  setCurrentMonth(prevMonth);
                }}
                style={{
                  background: "none",
                  border: "1px solid #e0e0e0",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ←
              </button>
              <button
                onClick={() => {
                  const nextMonth = new Date(currentMonth);
                  nextMonth.setMonth(currentMonth.getMonth() + 1);
                  setCurrentMonth(nextMonth);
                }}
                style={{
                  background: "none",
                  border: "1px solid #e0e0e0",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Days */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.5rem",
            marginBottom: "2rem"
          }}>
            {calendarDays.map((date) => {
              const dateString = formatDate(date);
              const isSelected = selectedDate === dateString;
              
              return (
                <button
                  key={dateString}
                  onClick={() => handleDateChange(dateString)}
                  style={{
                    background: isSelected ? "#667eea" : "white",
                    border: isSelected ? "2px solid #667eea" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "1rem 0.5rem",
                    cursor: "pointer",
                    textAlign: "center",
                    color: isSelected ? "white" : "#2d3a4a"
                  }}
                >
                  <div style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "bold",
                    marginBottom: "0.25rem"
                  }}>
                    {date.getDate()}
                  </div>
                  <div style={{ fontSize: "0.8rem" }}>
                    {getDayName(date)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem"
          }}>
            {loadingSlots ? (
              <div style={{ 
                gridColumn: "1 / -1", 
                textAlign: "center", 
                padding: "2rem",
                color: "#4a5568"
              }}>
                Cargando horarios disponibles...
              </div>
            ) : (
              availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => isAvailable ? setSelectedTime(slot.time) : null}
                    disabled={!isAvailable}
                    style={{
                      background: isSelected ? "#667eea" : isAvailable ? "white" : "#f5f5f5",
                      border: isSelected ? "2px solid #667eea" : isAvailable ? "1px solid #e0e0e0" : "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "1rem",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      color: isSelected ? "white" : isAvailable ? "#2d3a4a" : "#999",
                      fontSize: "1rem",
                      fontWeight: "500",
                      opacity: isAvailable ? 1 : 0.5
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })
            )}
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
              {professional.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "#2d3a4a" }}>
                {professional.name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                {professional.city}
              </div>
            </div>
          </div>

          {/* Selected Date and Time */}
          {selectedDate && (
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
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                {selectedTime && (
                  <div style={{ fontSize: "0.9rem", color: "#4a5568" }}>
                    🕐 {selectedTime}-{(() => {
                      const [hours, minutes] = selectedTime.split(':').map(Number);
                      const endTime = new Date();
                      endTime.setHours(hours, minutes + getTotalDuration());
                      return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    })()} ({getTotalDuration()} min de duración)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Services */}
          {selectedServices.map((service) => (
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

          {/* Total */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#2d3a4a",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "2px solid #f0f0f0"
          }}>
            <span>Total</span>
            <span>{getTotalPrice()} ARS</span>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            style={{
              width: "100%",
              background: (selectedDate && selectedTime) ? "#2d3a4a" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: (selectedDate && selectedTime) ? "pointer" : "not-allowed",
              marginTop: "1.5rem"
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTime;