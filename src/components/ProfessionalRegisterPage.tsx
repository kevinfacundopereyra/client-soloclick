import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/authService";
import type { ProfessionalRegisterData } from "../services/authService";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.registerProfessional(formData);
      console.log("Registro profesional response:", response);

      // Validación más estricta: SOLO éxito si tiene success=true Y token Y usuario
      if (response.success && response.token && response.user) {
        console.log(
          "✅ Registro profesional exitoso - iniciando sesión automáticamente"
        );
        console.log("🔍 Datos del usuario recibidos:", response.user);

        // Guardar sesión automáticamente
        authService.saveSession(response.token, response.user);

        // Verificar que se guardó correctamente
        const isAuthenticated = authService.isAuthenticated();
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("✅ Sesión profesional iniciada:", isAuthenticated);
        console.log("🔍 Usuario guardado en localStorage:", savedUser);

        alert("¡Registro de profesional exitoso! Ahora completa tu perfil");

        // Redirigir a completar perfil (Etapa 2)
        navigate("/profile/complete");
      } else {
        // Mostrar error específico
        console.log(
          "❌ Registro profesional falló - falta success, token o user"
        );
        console.log("- success:", response.success);
        console.log("- token:", !!response.token);
        console.log("- user:", !!response.user);
        setError(
          response.message ||
            "Error en el registro de profesional. Intenta nuevamente."
        );
      }
      // La alerta y navegación ya se realizan con mejor información arriba.
      // Se elimina el código incorrecto que usaba 'professionalId' no definido.
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
      {/* Left Side - Register Form */}
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
        {/* Header with back arrow */}
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

        {/* Title */}
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

        {/* Error Message */}
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

        {/* Register Form */}
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

      {/* Right Side - Image */}
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
