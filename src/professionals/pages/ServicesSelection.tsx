import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Professional } from "../components/ProfessionalCard";
import { fetchProfessionalById } from "../services/professionalsService";
import { useServicesByProfessional } from "../hooks/useServicesByProfessional";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

const ServicesSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

/*   const { services: realServices, loading: servicesLoading, error: servicesError } = useServicesByProfessional(id || ''); */
  const { services: realServices, loading: servicesLoading } = useServicesByProfessional(id || '');

  useEffect(() => {
    // Fetch real professional data
    const fetchProfessional = async () => {
      setLoading(true);
      
      try {
        if (id) {
          const professionalData = await fetchProfessionalById(id);
          
          if (professionalData) {
            // Asegurar que tenga todos los campos necesarios
            const professional: Professional = {
              id: professionalData._id || professionalData.id || id,
              name: professionalData.name || decodeURIComponent(id),
              email: professionalData.email || "profesional@example.com",
              phone: professionalData.phone || "+54 11 1234-5678",
              city: professionalData.city || "Buenos Aires",
              specialty: professionalData.specialty || "Barbería",
              rating: professionalData.rating || 4.5,
              appointmentDuration: professionalData.appointmentDuration || 45,
            };
            
            setProfessional(professional);
          } else {
            console.error('Profesional no encontrado');
            setProfessional(null);
          }
        }
      } catch (error) {
        console.error('Error fetching professional:', error);
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfessional();
    }
  }, [id]);

  const getServicesBySpecialty = (specialty: string): Service[] => {
    const services = {
      "Barbería": [
        { 
          id: "barba-basic", 
          name: "Barba", 
          description: "10 min con cualquier profesional", 
          price: "4000", 
          duration: "10" 
        },
        { 
          id: "corte-barba", 
          name: "Corte con barba", 
          description: "Renovar tu estilo con un corte de pelo a medida y una prolija definición de barba. Lavado incluido.", 
          price: "10000", 
          duration: "40" 
        },
        { 
          id: "corte-pelo", 
          name: "Corte de pelo", 
          description: "Corte personalizado con las mejores técnicas", 
          price: "9000", 
          duration: "30" 
        },
      ],
      "Manicura": [
        { 
          id: "manicura-basica", 
          name: "Manicura Básica", 
          description: "Limado, cutícula y esmaltado tradicional", 
          price: "1800", 
          duration: "40" 
        },
        { 
          id: "manicura-semi", 
          name: "Manicura Semipermanente", 
          description: "Esmaltado con duración de 3 semanas", 
          price: "3000", 
          duration: "60" 
        },
        { 
          id: "nail-art", 
          name: "Nail Art", 
          description: "Diseños personalizados en uñas", 
          price: "4000", 
          duration: "90" 
        },
      ],
      "Peluquería": [
        { 
          id: "corte-peinado", 
          name: "Corte y Peinado", 
          description: "Corte personalizado con peinado profesional", 
          price: "3000", 
          duration: "50" 
        },
        { 
          id: "coloracion", 
          name: "Coloración", 
          description: "Tintura completa del cabello con productos premium", 
          price: "5500", 
          duration: "120" 
        },
        { 
          id: "tratamiento", 
          name: "Tratamiento Capilar", 
          description: "Hidratación profunda para cabello dañado", 
          price: "4000", 
          duration: "60" 
        },
      ]
    };

    return services[specialty as keyof typeof services] || services["Barbería"];
  };

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.price), 0);
  };

  const getDisplayServices = () => {
    if (realServices && realServices.length > 0) {
      // Usar servicios reales del profesional
      return realServices.map(service => ({
        id: service._id,
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        duration: service.duration.toString()
      }));
    } else {
      // Fallback a servicios por defecto si no tiene servicios configurados
      return getServicesBySpecialty(professional?.specialty || 'Barbería');
    }
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Por favor selecciona al menos un servicio");
      return;
    }
    
    // Store selected services in localStorage for the next step
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    localStorage.setItem('professionalData', JSON.stringify(professional));
    
    navigate(`/reservar/horario/${id}`);
  };

  if (loading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">
          Cargando servicios del profesional...
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-lg mb-4 text-gray-700">
          Profesional no encontrado
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

  const services = getDisplayServices();

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => navigate(`/profesional/${id}`)}
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
          Servicios
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Services List */}
        <div className="lg:col-span-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Hair & styling
          </h2>

          <div className="flex flex-col gap-4 sm:gap-6">
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`bg-white rounded-lg p-4 sm:p-6 cursor-pointer relative transition-all ${
                    isSelected ? "border-2 border-indigo-500" : "border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="m-0 mb-2 text-base sm:text-lg font-semibold text-gray-800">
                        {service.name}
                      </h3>
                      <p className="m-0 mb-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                        {service.description}
                      </p>
                      <div className="text-sm sm:text-base text-gray-600">
                        {service.duration} min
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-gray-800 mt-2">
                        {service.price} ARS
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {!isSelected && (
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-2xl text-gray-300 cursor-pointer"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
            disabled={selectedServices.length === 0}
            className={`w-full rounded-lg p-3 sm:p-4 text-base font-semibold mt-4 sm:mt-6 transition ${
              selectedServices.length > 0 
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

export default ServicesSelection;