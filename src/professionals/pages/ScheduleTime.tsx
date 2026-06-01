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
    
    console.log('🔍 Datos cargados del localStorage:');
    console.log('- Services:', servicesData ? JSON.parse(servicesData) : null);
    console.log('- Professional:', professionalData ? JSON.parse(professionalData) : null);
    
    if (servicesData) {
      setSelectedServices(JSON.parse(servicesData));
    }
    
    if (professionalData) {
      const prof = JSON.parse(professionalData);
      setProfessional(prof);
      
      // Set default date to today
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log('🔍 Fecha inicial:', todayString);
      setSelectedDate(todayString);
      
      // Load available slots for today - solo si tenemos el professional
      if (prof?.id || prof?._id) {
        const professionalId = prof.id || prof._id;
        console.log('🔍 Cargando slots para profesional:', professionalId);
        loadAvailableSlots(professionalId, todayString);
      } else {
        console.log('❌ No se encontró ID del profesional');
      }
    }
  }, []);

  // ✅ ACTUALIZAR - Función para cargar horarios disponibles
  const loadAvailableSlots = async (professionalId: string, date: string) => {
    console.log(`🔍 loadAvailableSlots llamado con:`, { professionalId, date });
    setLoadingSlots(true);
    
    try {
      const response = await appointmentsService.getAvailableSlots(professionalId, date);
      
      console.log('🔍 Respuesta del appointmentsService:', response);
      console.log('🔍 Success:', response.success);
      console.log('🔍 Slots recibidos:', response.slots);
      console.log('🔍 Cantidad de slots:', response.slots?.length || 0);
      
      if (response.success && response.slots) {
        setAvailableSlots(response.slots);
        console.log('✅ Slots establecidos en el estado:', response.slots.length);
      } else {
        console.log('⚠️ Response no exitosa o sin slots, estableciendo array vacío');
        setAvailableSlots([]); // ✅ Array vacío en lugar de mock
      }
    } catch (error) {
      console.error('❌ Error loading available slots:', error);
      setAvailableSlots([]); // ✅ Array vacío en lugar de mock
    } finally {
      setLoadingSlots(false);
      console.log('🔍 Loading slots finalizado');
    }
  };

  // ❌ ELIMINAR COMPLETAMENTE esta función:
  // const generateMockAvailableSlots = (): AvailableSlot[] => { ... }

  // ✅ ACTUALIZAR - Función para manejar el cambio de fecha
  const handleDateChange = (newDate: string) => {
    console.log(`🔍 Cambio de fecha a: ${newDate}`);
    setSelectedDate(newDate);
    setSelectedTime(""); // Reset selected time
    
    if (professional?.id || professional?.id) {
      const professionalId = professional.id || professional.id;
      console.log(`🔍 Cargando slots para nueva fecha: ${newDate}, profesional: ${professionalId}`);
      loadAvailableSlots(professionalId, newDate);
    } else {
      console.log('❌ No hay professional ID para cargar slots');
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

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/reservar/servicios/${id}`)}
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
          Seleccionar hora
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Calendar and Time Selection */}
        <div className="lg:col-span-3">
          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="text-2xl">📅</div>
              <div className="text-lg sm:text-xl font-semibold text-gray-800">
                {getMonthName(currentMonth)} de {currentMonth.getFullYear()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const prevMonth = new Date(currentMonth);
                  prevMonth.setMonth(currentMonth.getMonth() - 1);
                  setCurrentMonth(prevMonth);
                }}
                className="bg-none border border-gray-300 rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
              >
                ←
              </button>
              <button
                onClick={() => {
                  const nextMonth = new Date(currentMonth);
                  nextMonth.setMonth(currentMonth.getMonth() + 1);
                  setCurrentMonth(nextMonth);
                }}
                className="bg-none border border-gray-300 rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 mb-6 sm:mb-8">
            {calendarDays.map((date) => {
              const dateString = formatDate(date);
              const isSelected = selectedDate === dateString;
              
              return (
                <button
                  key={dateString}
                  onClick={() => handleDateChange(dateString)}
                  className={`rounded-lg p-2 sm:p-3 cursor-pointer text-center transition ${
                    isSelected 
                      ? "bg-indigo-500 border-2 border-indigo-500 text-white" 
                      : "bg-white border border-gray-300 text-gray-800 hover:border-gray-400"
                  }`}
                >
                  <div className="text-lg sm:text-xl font-bold mb-1">
                    {date.getDate()}
                  </div>
                  <div className="text-xs sm:text-sm">
                    {getDayName(date)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {loadingSlots ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                Cargando horarios disponibles...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="col-span-full text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-lg mb-2">📅 No hay horarios disponibles</div>
                <div className="text-sm text-gray-600">
                  El profesional no trabaja este día o no hay horarios libres
                </div>
              </div>
            ) : (
              availableSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;
                
                if (index === 0) {
                  console.log(`🔍 Renderizando ${availableSlots.length} slots para ${selectedDate}`);
                }
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (isAvailable) {
                        console.log(`🔍 Hora seleccionada: ${slot.time}`);
                        setSelectedTime(slot.time);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`rounded-lg p-3 text-sm sm:text-base font-medium transition ${
                      isSelected 
                        ? "bg-indigo-500 border-2 border-indigo-500 text-white"
                        : isAvailable
                        ? "bg-white border border-gray-300 text-gray-800 hover:border-gray-400 cursor-pointer"
                        : "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-lg p-4 sm:p-6 h-fit sticky top-4">
          {/* Professional Info */}
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mr-4 flex-shrink-0">
              {professional.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 truncate">
                {professional.name}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {professional.city}
              </div>
            </div>
          </div>

          {/* Selected Date and Time */}
          {selectedDate && (
            <div className="flex items-start gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="text-lg flex-shrink-0">📅</span>
              <div className="min-w-0">
                <div className="text-gray-800">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                {selectedTime && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    🕐 {selectedTime}-{(() => {
                      const [hours, minutes] = selectedTime.split(':').map(Number);
                      const endTime = new Date();
                      endTime.setHours(hours, minutes + getTotalDuration());
                      return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    })()} ({getTotalDuration()} min)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Services */}
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between items-start gap-2 mb-4 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="min-w-0">
                <div className="font-medium text-gray-800 truncate">
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

          {/* Total */}
          <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-800 mt-4 pt-4 border-t-2 border-gray-100">
            <span>Total</span>
            <span>{getTotalPrice()} ARS</span>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className={`w-full rounded-lg p-3 sm:p-4 text-base font-semibold mt-4 sm:mt-6 transition ${
              (selectedDate && selectedTime)
                ? "bg-gray-800 text-white hover:bg-gray-900 cursor-pointer" 
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTime;