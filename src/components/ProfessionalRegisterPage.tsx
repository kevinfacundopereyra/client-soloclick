import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/authService";
import type { ProfessionalRegisterData } from "../services/authService";

// ✅ AÑADIDO: Importamos el componente del mapa con buscador que creamos
import LocationPickerWithSearch from "../components/LocationPickerWithSearch";

// ✅ AÑADIDO: Definimos un tipo para la estructura de la ubicación
type LocationData = {
  address: string;
  latitude: number;
  longitude: number;
};

type ServiceInput = {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
};

const ProfessionalRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfessionalRegisterData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    specialty: "",
  });

  // ✅ AÑADIDO: Un nuevo estado para guardar las ubicaciones que el profesional seleccione en el mapa
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [services, setServices] = useState<ServiceInput[]>([
    {
      name: "",
      description: "",
      price: "",
      duration: "60",
      category: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specialties = [
    "Peluquería",
    "Barbería",
    "Manicura/Pedicura",
    "Estética Facial",
    "Masajes",
    "Depilación",
    "Cejas y Pestañas",
    "Tatuajes",
    "Medicina Estética",
    "Dermatología",
    "Fisioterapia",
    "Otro",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null); // limpiar error al escribir
  };

  const updateServiceField = (
    index: number,
    field: keyof ServiceInput,
    value: string,
  ) => {
    setServices((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
    if (error) setError(null);
  };

  const addService = () => {
    setServices((prev) => [
      ...prev,
      { name: "", description: "", price: "", duration: "60", category: "" },
    ]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ AÑADIDO: Validación para asegurar que se haya seleccionado una ubicación en el mapa
    if (locations.length === 0) {
      setError(
        "Debes buscar y seleccionar la dirección de tu local en el mapa."
      );
      return;
    }

    const validServices = services.filter(
      (service) =>
        service.name.trim() &&
        service.description.trim() &&
        service.price.trim() &&
        service.duration.trim() &&
        service.category.trim(),
    );

    if (validServices.length === 0) {
      setError("Debes agregar al menos un servicio con precio y duración.");
      return;
    }

    const invalidService = validServices.find(
      (service) =>
        Number.isNaN(parseFloat(service.price)) ||
        Number.isNaN(parseInt(service.duration, 10)),
    );

    if (invalidService) {
      setError("Asegúrate de que todos los servicios tienen precio y duración válidos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedServices = validServices.map((service) => ({
        name: service.name.trim(),
        description: service.description.trim(),
        price: Number(service.price),
        duration: Number(service.duration),
        category: service.category.trim(),
      }));

      const dataToSend = {
        ...formData,
        locations,
        services: normalizedServices,
      };

      // ✅ MODIFICADO: Enviamos el objeto completo (con ubicaciones y servicios) al backend
      const response = await authService.registerProfessional(dataToSend);
      console.log("Registro profesional response:", response);

      if (response.success && response.token && response.user) {
        console.log(
          "✅ Registro profesional exitoso - iniciando sesión automáticamente"
        );
        authService.saveSession(response.token, response.user);
        alert("¡Registro de profesional exitoso! Ahora completa tu perfil");
        navigate("/profile/complete");
      } else {
        setError(
          response.message ||
            "Error en el registro de profesional. Intenta nuevamente."
        );
      }
    } catch (error: any) {
      console.error("❌ Error en registro profesional:", error);
      setError(error.message || "Error de conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-system">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col justify-center w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
        <div
          onClick={() => navigate("/login")}
          className="absolute top-6 sm:top-8 left-4 sm:left-6 lg:left-8 flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
        >
          <span className="text-xl sm:text-2xl mr-2">←</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 text-center">
          Registro de Profesional
        </h1>

        <p className="text-center text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 lg:mb-10">
          Únete a nuestra plataforma y haz crecer tu negocio
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base text-center">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="+54 11 1234-5678"
            />
          </div>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
              placeholder="Tu ciudad"
            />
          </div>
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Especialidad
            </label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
              onFocus={(e) => e.currentTarget.classList.add('border-indigo-600')}
              onBlur={(e) => e.currentTarget.classList.remove('border-indigo-600')}
            >
              <option value="">Selecciona tu especialidad</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Servicios que ofreces */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 m-0">
                Servicios que ofreces
              </h2>
              <button
                type="button"
                onClick={addService}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg cursor-pointer font-semibold text-sm sm:text-base transition-colors whitespace-nowrap"
              >
                + Agregar servicio
              </button>
            </div>

            {services.map((service, index) => (
              <div
                key={`service-${index}`}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 sm:p-5 border border-gray-200 rounded-lg bg-white"
              >
                <div className="sm:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
                    <strong className="text-gray-800 text-sm sm:text-base">
                      Servicio {index + 1}
                    </strong>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="bg-transparent text-red-600 border-0 cursor-pointer font-bold text-sm hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 text-sm font-medium">
                    Nombre del servicio
                  </label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) =>
                      updateServiceField(index, "name", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Ej: Corte clásico"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 text-sm font-medium">
                    Categoría
                  </label>
                  <select
                    value={service.category}
                    onChange={(e) =>
                      updateServiceField(index, "category", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                  >
                    <option value="">Selecciona categoría</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 text-sm font-medium">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={service.price}
                    onChange={(e) =>
                      updateServiceField(index, "price", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Ej: 4500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 text-sm font-medium">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={service.duration}
                    onChange={(e) =>
                      updateServiceField(index, "duration", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Ej: 45"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 text-gray-700 text-sm font-medium">
                    Descripción
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) =>
                      updateServiceField(index, "description", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-vertical"
                    placeholder="Describe brevemente este servicio"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block mb-2 sm:mb-3 text-gray-800 font-medium text-sm sm:text-base">
              Busca y selecciona la dirección de tu local
            </label>
            <LocationPickerWithSearch
              onLocationSelect={(data) => {
                const newLocation: LocationData = {
                  address: data.address,
                  latitude: data.latitude,
                  longitude: data.longitude,
                };
                setLocations([newLocation]);
                if (error) setError(null);
              }}
            />
          </div>

          {/* Confirmación de ubicación */}
          {locations.length > 0 && (
            <div className="bg-teal-50 border border-teal-300 text-teal-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm text-center">
              <strong>Ubicación seleccionada:</strong> {locations[0].address}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-white transition-colors duration-200 text-sm sm:text-base ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
            }`}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta profesional"}
          </button>
        </form>
      </div>

      {/* Right Side - Image (hidden on mobile and tablet) */}
      <div
        className="hidden lg:flex lg:flex-1 relative bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
      </div>
    </div>
  );
};

export default ProfessionalRegisterPage;
