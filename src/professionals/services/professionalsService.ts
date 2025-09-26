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
    return [
      {
        name: "Dr. Juan Pérez",
        email: "juan.perez@ejemplo.com",
        phone: "+54 11 1234-5678",
        city: "Buenos Aires",
        specialty: "Cardiología",
        rating: 4.8,
        appointmentDuration: 30
      },
      {
        name: "Dra. María González",
        email: "maria.gonzalez@ejemplo.com", 
        phone: "+54 11 8765-4321",
        city: "Córdoba",
        specialty: "Dermatología",
        rating: 4.9,
        appointmentDuration: 45
      },
      {
        name: "Dr. Carlos López",
        email: "carlos.lopez@ejemplo.com",
        phone: "+54 11 5555-6666",
        city: "Rosario", 
        specialty: "Traumatología",
        rating: 4.7,
        appointmentDuration: 25
      }
    ];
  }
}
