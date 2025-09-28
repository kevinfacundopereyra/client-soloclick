import React from "react";

interface UserProfileProps {
  name: string;
  role: "user" | "professional";
  avatarUrl?: string;
}

import { useNavigate } from "react-router-dom";

const UserProfile: React.FC<UserProfileProps> = ({ name, role, avatarUrl }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
      onClick={() => navigate("/profile")}
      title="Ver perfil"
    >
      {/*
        Si no hay avatarUrl ni nombre, usa "Usuario" como valor por defecto para el avatar.
        Esto asegura que siempre se muestre una imagen de perfil.
      */}
      <img
        src={avatarUrl || "https://ui-avatars.com/api/?name=" + (name || "Usuario")}
        alt="avatar"
        style={{ width: 32, height: 32, borderRadius: "50%" }}
      />
      <span style={{ fontWeight: "bold" }}>{name}</span>
      <span style={{ fontSize: "0.8rem", color: "#888" }}>
        {role === "user" ? "Usuario" : "Profesional"}
      </span>
    </div>
  );
};

export default UserProfile;
