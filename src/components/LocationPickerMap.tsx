import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import mapPinIcon from "../assets/map-pin-svgrepo-com.svg";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GeocoderControl = ({
  setCenter,
}: {
  setCenter: (coords: L.LatLng) => void;
}) => {
  const map = useMap();
  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: "Buscar dirección...",
      errorMessage: "No se encontró la dirección.",
    })
      .on("markgeocode", function (e) {
        const center = e.geocode.center;
        map.setView(center, 15);
        setCenter(center);
      })
      .addTo(map);
    return () => {
      map.removeControl(geocoder);
    };
  }, [map, setCenter]);
  return null;
};

const MapMoveHandler = ({
  setCenter,
}: {
  setCenter: (coords: L.LatLng) => void;
}) => {
  const map = useMapEvents({
    dragend() {
      setCenter(map.getCenter());
    },
  });
  return null;
};

interface LocationPickerMapProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  onLocationSelect,
}) => {
  const [initialCenter, setInitialCenter] = useState<L.LatLng | null>(null);
  const [currentCenter, setCurrentCenter] = useState<L.LatLng | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Obteniendo tu ubicación inicial..."
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatusMessage("¡Ubicación encontrada!");
        const userCoords = new L.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setInitialCenter(userCoords);
        setCurrentCenter(userCoords);
      },
      (error) => {
        console.error("ERROR DE GEOLOCALIZACIÓN:", error.message);
        let message =
          "No se pudo obtener tu ubicación. Revisa los permisos del navegador.";
        if (error.code === 1) {
          // PERMISSION_DENIED
          message =
            "Permiso de ubicación denegado. Por favor, habilítalo en la configuración del sitio.";
        }
        setStatusMessage(message);

        const fallbackCoords = new L.LatLng(-34.6037, -58.3816); // Buenos Aires
        setInitialCenter(fallbackCoords);
        setCurrentCenter(fallbackCoords);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const handleConfirmLocation = () => {
    if (currentCenter) {
      onLocationSelect({ lat: currentCenter.lat, lng: currentCenter.lng });
    }
  };

  // No renderiza el mapa hasta tener una ubicación inicial, para evitar el problema del zoom
  if (!initialCenter) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p style={{ fontWeight: "bold" }}>{statusMessage}</p>
        {statusMessage.includes("Permiso") && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Hacé clic en el candado 🔒 en la barra de direcciones para cambiar
            los permisos de ubicación a "Permitir".
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "400px", width: "100%" }}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <MapMoveHandler setCenter={setCurrentCenter} />
        <GeocoderControl setCenter={setCurrentCenter} />
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -100%)",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <img
          src={mapPinIcon}
          alt="Pin de ubicación"
          style={{ height: "40px", width: "40px" }}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <p style={{ margin: "0 0 10px 0", color: "#4a5568" }}>
          Mueve el mapa para seleccionar esta ubicación
        </p>
        <button
          onClick={handleConfirmLocation}
          style={{
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Confirmar Ubicación
        </button>
      </div>
    </div>
  );
};

export default LocationPickerMap;
