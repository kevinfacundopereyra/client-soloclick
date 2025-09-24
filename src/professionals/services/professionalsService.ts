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
}
