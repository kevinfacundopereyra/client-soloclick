import React from "react";

import { useNavigate } from "react-router-dom";


interface UserProfileProps {
  name: string;
  role: "user" | "professional";
  avatarUrl?: string;
}


const UserProfile: React.FC<UserProfileProps> = ({ name, role, avatarUrl }) => {
  const navigate = useNavigate();
  
  return (
    <div
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem", 
        cursor: "pointer",
        padding: "0.5rem 1rem",
        background: "rgba(102, 126, 234, 0.1)",
        borderRadius: "20px",
        transition: "background-color 0.2s"
      }}
      onClick={() => navigate("/profile")}
      title="Ver perfil"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
      }}
    >
      {/* Avatar */}
      <div style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: avatarUrl 
          ? `url(${avatarUrl}) center/cover` 
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "0.9rem"
      }}>
        {!avatarUrl && (name?.charAt(0).toUpperCase() || 'U')}
      </div>
      
      {/* Name */}
      <span style={{ 
        fontWeight: "500", 
        color: "#4a5568",
        fontSize: "0.95rem"
      }}>
        {name || 'Usuario'}
      </span>
      
      {/* Role badge */}
      <span style={{ 
        fontSize: "0.75rem", 
        color: "#667eea",
        background: "rgba(102, 126, 234, 0.1)",
        padding: "0.2rem 0.5rem",
        borderRadius: "12px",
        fontWeight: "500"
      }}>
        {role === "user" ? "Cliente" : "Pro"}

      </span>
    </div>
  );
};


export default UserProfile;

