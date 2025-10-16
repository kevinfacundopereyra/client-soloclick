import React from "react";
import paymentsService from "../services/paymentsService";

const CreatePaymentButton: React.FC = () => {
  const handleCreatePayment = async () => {
    try {
      const response = await paymentsService.createPayment({
        serviceName: "Consulta psicológica",
        amount: 1500,
        // Agrega aquí otros campos requeridos por tu backend
      });
      console.log("Respuesta de la API:", response);
      if (response.preference_url) {
        window.location.href = response.preference_url;
      } else {
        alert("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error("Error al crear el pago:", error);
      alert("Error al crear el pago");
    }
  };

  return (
    <button onClick={handleCreatePayment} style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer"
    }}>
      Pagar ahora
    </button>
  );
};

export default CreatePaymentButton;
