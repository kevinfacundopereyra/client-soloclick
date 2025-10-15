import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

type Professional = {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  specialty?: string;
  city?: string;
};

function ProfessionalsFeatured() {
  const { id } = useParams();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await axios.get(`/api/professionals/${id}`);
        setProfessional(response.data);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [id]);

  if (loading) return <div style={{ padding: "2rem" }}>Cargando perfil...</div>;
  if (!professional)
    return <div style={{ padding: "2rem" }}>Perfil no encontrado</div>;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        {professional.name}
      </h1>
      <p style={{ color: "#4a5568", marginBottom: "1rem" }}>
        <strong>Especialidad:</strong> {professional.specialty} <br />
        <strong>Ciudad:</strong> {professional.city}
      </p>
      <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
        {professional.description ||
          "Este profesional aún no ha agregado una descripción."}
      </p>

      {/* Galería de imágenes */}
      {professional.images && professional.images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {professional.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Trabajo ${index + 1}`}
              style={{
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      )}

      {/* Botón de contratar */}
      <button
        style={{
          backgroundColor: "#667eea",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
        }}
        onClick={() => alert("¡Has contratado a este profesional!")}
      >
        Contratar
      </button>
    </div>
  );
}

export default ProfessionalsFeatured;
