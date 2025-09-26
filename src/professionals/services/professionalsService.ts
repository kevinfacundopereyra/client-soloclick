/* // Simulación de fetch de profesionales
export async function fetchProfessionals() {
  // Aquí deberías hacer un fetch real a tu backend/API
  return [
    { id: 1, name: "Juan Pérez", profession: "Médico" },
    { id: 2, name: "Ana Gómez", profession: "Abogada" },
    { id: 3, name: "Carlos Ruiz", profession: "Ingeniero" },
  ];
} */

import axios from "axios";

export async function fetchProfessionals() {
  try {
    const response = await axios.get("http://localhost:3000/professionals");
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Si la respuesta es un objeto con una propiedad 'data' que es un array
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Si no es ninguno de los casos, retorna un array vacío
    return [];
  } catch (error) {
    console.log("Error conectando al servidor, usando datos de prueba:", error);
    // Datos de prueba mientras no esté el servidor
    return getMockProfessionals();
  }
}

// Función para obtener profesionales por especialidad
export async function fetchProfessionalsBySpecialty(specialty: string) {
  try {
    const response = await axios.get(`http://localhost:3000/professionals?specialty=${specialty}`);
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Si la respuesta es un objeto con una propiedad 'data' que es un array
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Si no es ninguno de los casos, retorna un array vacío
    return [];
  } catch (error) {
    console.log(`Error conectando al servidor para ${specialty}, usando datos de prueba:`, error);
    // Datos de prueba filtrados por especialidad
    return getMockProfessionals().filter(prof => prof.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
}

// Función auxiliar para datos de prueba
function getMockProfessionals() {
  return [
    {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@ejemplo.com",
      phone: "+54 11 1111-2222",
      city: "Buenos Aires",
      specialty: "Barbería",
      rating: 4.9,
      appointmentDuration: 45
    },
    {
      name: "Miguel Torres",
      email: "miguel.torres@ejemplo.com",
      phone: "+54 11 3333-4444",
      city: "Córdoba",
      specialty: "Barbería",
      rating: 4.7,
      appointmentDuration: 30
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@ejemplo.com",
      phone: "+54 11 5555-6666",
      city: "Rosario",
      specialty: "Manicura",
      rating: 4.8,
      appointmentDuration: 60
    },
    {
      name: "Sofía Herrera",
      email: "sofia.herrera@ejemplo.com", 
      phone: "+54 11 7777-8888",
      city: "Buenos Aires",
      specialty: "Manicura",
      rating: 4.9,
      appointmentDuration: 50
    },
    {
      name: "Dr. Juan Pérez",
      email: "juan.perez@ejemplo.com",
      phone: "+54 11 1234-5678",
      city: "Buenos Aires",
      specialty: "Peluquería",
      rating: 4.8,
      appointmentDuration: 30
    },
    {
      name: "Dra. María González",
      email: "maria.gonzalez@ejemplo.com", 
      phone: "+54 11 8765-4321",
      city: "Córdoba",
      specialty: "Peluquería",
      rating: 4.9,
      appointmentDuration: 45
    }
  ];
}
