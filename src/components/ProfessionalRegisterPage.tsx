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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <div
          onClick={() => navigate("/login")}
          style={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "#4a5568",
          }}
        >
          <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>←</span>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#2d3748",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Registro de Profesional
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#718096",
            marginBottom: "2rem",
          }}
        >
          Únete a nuestra plataforma y haz crecer tu negocio
        </p>

        {error && (
          <div
            style={{
              background: "#fed7d7",
              border: "1px solid #feb2b2",
              color: "#c53030",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              placeholder="+54 11 1234-5678"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              placeholder="Tu ciudad"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
              Especialidad
            </label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            >
              <option value="">Selecciona tu especialidad</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ AÑADIDO: Modalidad de servicios ofrecidos */}
          <div
            style={{
              background: "#f7fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  color: "#2d3748",
                }}
              >
                Servicios que ofreces
              </h2>
              <button
                type="button"
                onClick={addService}
                style={{
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                + Agregar servicio
              </button>
            </div>

            {services.map((service, index) => (
              <div
                key={`service-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "white",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong style={{ color: "#2d3748" }}>
                      Servicio {index + 1}
                    </strong>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        style={{
                          background: "transparent",
                          color: "#e53e3e",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Nombre del servicio
                  </label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) =>
                      updateServiceField(index, "name", e.target.value)
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                    placeholder="Ej: Corte clásico"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Categoría
                  </label>
                  <select
                    value={service.category}
                    onChange={(e) =>
                      updateServiceField(index, "category", e.target.value)
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      background: "white",
                    }}
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
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                    placeholder="Ej: 4500"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                    placeholder="Ej: 45"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Descripción
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) =>
                      updateServiceField(index, "description", e.target.value)
                    }
                    required
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                    placeholder="Describe brevemente este servicio"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ✅ AÑADIDO: El componente de mapa con buscador */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#2d3748",
                fontWeight: "500",
              }}
            >
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

          {/* ✅ AÑADIDO: Confirmación visual de la dirección seleccionada */}
          {locations.length > 0 && (
            <div
              style={{
                background: "#e6fffa",
                border: "1px solid #b2f5ea",
                color: "#237a6b",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              <strong>Ubicación seleccionada:</strong> {locations[0].address}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#a0aec0" : "#667eea",
              color: "white",
              border: "none",
              padding: "0.875rem",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "1rem",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              !loading &&
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#5a67d8")
            }
            onMouseOut={(e) =>
              !loading &&
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#667eea")
            }
          >
            {loading ? "Creando cuenta..." : "Crear cuenta profesional"}
          </button>
        </form>
      </div>

      <div
        style={{
          flex: 1,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
          }}
        />
      </div>
    </div>
  );
};

export default ProfessionalRegisterPage;
