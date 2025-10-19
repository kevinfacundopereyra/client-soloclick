import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet-routing-machine";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { Professional } from "../professionals/components/ProfessionalCard";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  branchName?: string;
}

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface RoutingProps {
  userLocation: L.LatLng;
  professionalLocation: L.LatLng;
}

const RoutingMachine: React.FC<RoutingProps> = ({
  userLocation,
  professionalLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(professionalLocation)],
      routeWhileDragging: true,
      lineOptions: { styles: [{ color: "#6FA1EC", weight: 4 }] },
      show: true,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      language: "es",
    } as any).addTo(map);
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userLocation, professionalLocation]);

  return null;
};

interface ProfessionalDetailMapProps {
  professional: Professional;
}

const ProfessionalDetailMap: React.FC<ProfessionalDetailMapProps> = ({
  professional,
}) => {
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Location | null>(null);

  // ✅ CORREGIDO: Se restaura la lógica original.
  // Ahora SIEMPRE pide la ubicación actual al navegador y no lee del localStorage.
  useEffect(() => {
    console.log(
      "🗺️ Pidiendo ubicación actual al navegador para trazar la ruta..."
    );
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(
          new L.LatLng(position.coords.latitude, position.coords.longitude)
        );
      },
      () => {
        // Si el usuario no da permiso, usa una ubicación por defecto.
        console.warn(
          "⚠️ No se pudo obtener la ubicación, usando ubicación por defecto."
        );
        setUserLocation(new L.LatLng(-34.6037, -58.3816)); // Fallback a Buenos Aires
      }
    );
  }, []); // El array vacío asegura que esto solo se ejecute una vez al cargar el mapa.

  useEffect(() => {
    if (professional.locations && professional.locations.length > 0) {
      setSelectedBranch(professional.locations[0]);
    }
  }, [professional.locations]);

  if (!professional.locations || professional.locations.length === 0) {
    return <div>Este profesional no tiene ubicaciones registradas.</div>;
  }

  // Esperamos a tener la ubicación del usuario para no mostrar un mapa vacío
  if (!userLocation) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Obteniendo tu ubicación para calcular la ruta...
      </div>
    );
  }

  const mapCenter: LatLngExpression = [
    professional.locations[0].latitude,
    professional.locations[0].longitude,
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h3>Nuestras Sucursales</h3>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="..."
        />

        <Marker position={userLocation}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        {professional.locations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.latitude, loc.longitude]}
            eventHandlers={{ click: () => setSelectedBranch(loc) }}
          >
            <Popup>
              <b>{loc.branchName || professional.name}</b>
              <br />
              {loc.address}
            </Popup>
          </Marker>
        ))}

        {userLocation && selectedBranch && (
          <RoutingMachine
            userLocation={userLocation}
            professionalLocation={
              new L.LatLng(selectedBranch.latitude, selectedBranch.longitude)
            }
          />
        )}
      </MapContainer>
    </div>
  );
};

export default ProfessionalDetailMap;
