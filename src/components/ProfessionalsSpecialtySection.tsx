import ProfessionalCard from "../professionals/components/ProfessionalCard";
import { useProfessionalsBySpecialty } from "../professionals/hooks/useProfessionalsBySpecialty";

interface ProfessionalsSpecialtySectionProps {
  specialty: string;
  title: string;
  maxItems?: number;
}

const ProfessionalsSpecialtySection = ({ 
  specialty, 
  title, 
  maxItems = 4 
}: ProfessionalsSpecialtySectionProps) => {
  const { professionals, loading, error } = useProfessionalsBySpecialty(specialty);

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem 0',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Cargando {title.toLowerCase()}...
      </div>
    );
  }

  if (error || professionals.length === 0) {
    return null; // No mostrar la sección si hay error o no hay profesionales
  }

  // Limitar la cantidad de profesionales mostrados
  const displayedProfessionals = professionals.slice(0, 3); // se cambio maxItems a 3 items para que sea vea mas prolijo por ahora

  return (
    <section style={{ 
      padding: '3rem 0',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Título de la sección */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '2rem',
        textAlign: 'left',
        paddingLeft: '2rem'
      }}>
        {title}
      </h2>

      {/* Grid de profesionales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        padding: '0 2rem'
      }}>
        {displayedProfessionals.map((professional, index) => (
          <ProfessionalCard 
            key={`${specialty}-${index}`} 
            professional={professional} 
          />
        ))}
      </div>

      {/* Botón ver más si hay más profesionales */}
      {professionals.length > maxItems && (
        <div style={{
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <button style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '25px',
            fontSize: '1rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s'
          }}>
            Ver más {title.toLowerCase()} ({professionals.length - maxItems} más)
          </button>
        </div>
      )}
    </section>
  );
};

export default ProfessionalsSpecialtySection;