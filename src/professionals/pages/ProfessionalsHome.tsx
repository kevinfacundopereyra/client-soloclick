import { useProfessionals } from "../hooks/useProfessionals";

function ProfessionalsHome() {
  const { professionals, loading, error } = useProfessionals();

  if (loading) return <div>Cargando profesionales...</div>;
  if (error) return <div>Error al cargar profesionales</div>;

  return (
    <div>
      <h2>Lista de Profesionales</h2>
      <ul>
        {professionals.map((pro) => (
          <li key={pro.id}>
            {pro.name} - {pro.profession}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfessionalsHome;
