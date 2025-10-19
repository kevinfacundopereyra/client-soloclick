import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet-routing-machine";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { Professional } from "../professionals/components/ProfessionalCard";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const searchLocationIcon = new L.DivIcon({
  className: "custom-pin",
  html: `<div style="background-color: #667eea; width: 2rem; height: 2rem; display: block; left: -1rem; top: -1rem; position: relative; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 1px solid #FFF; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const RoutingMachine = ({ start, end }: { start: L.LatLng; end: L.LatLng }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: { styles: [{ color: "#6FA1EC", weight: 4 }] },
    } as any).addTo(map);

    // ✅ CORREGIDO: Añadimos llaves para que la función de limpieza no devuelva nada.
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
};

interface ProfessionalsListMapProps {
  professionals: Professional[];
  selectedLocation?: { lat: string | null; lng: string | null };
}

const ProfessionalsListMap: React.FC<ProfessionalsListMapProps> = ({
  professionals,
  selectedLocation,
}) => {
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setUserLocation(
        new L.LatLng(position.coords.latitude, position.coords.longitude)
      )
    );
  }, []);

  let startPoint: L.LatLng | null = null;
  if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
    startPoint = new L.LatLng(
      parseFloat(selectedLocation.lat),
      parseFloat(selectedLocation.lng)
    );
  } else if (userLocation) {
    startPoint = userLocation;
  }

  return (
    <MapContainer
      center={startPoint || [-34.6037, -58.3816]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />

      {userLocation && !selectedLocation?.lat && (
        <Marker position={userLocation}>
          <Popup>Tu ubicación física</Popup>
        </Marker>
      )}

      {selectedLocation && selectedLocation.lat && selectedLocation.lng && (
        <Marker
          position={[
            parseFloat(selectedLocation.lat),
            parseFloat(selectedLocation.lng),
          ]}
          icon={searchLocationIcon}
        >
          <Popup>Punto de búsqueda</Popup>
        </Marker>
      )}

      {professionals
        .filter((prof) => prof && prof.locations && prof.locations.length > 0)
        .map((prof) => {
          const firstLocation = prof.locations[0];
          const profPosition: LatLngExpression = [
            firstLocation.latitude,
            firstLocation.longitude,
          ];
          return (
            <Marker
              key={prof._id || prof.id}
              position={profPosition}
              eventHandlers={{ click: () => setSelectedProfessional(prof) }}
            >
              <Popup>
                <b>{prof.name}</b>
                <br />
                {prof.specialty}
              </Popup>
            </Marker>
          );
        })}

      {selectedProfessional && startPoint && (
        <RoutingMachine
          start={startPoint}
          end={
            new L.LatLng(
              selectedProfessional.locations[0].latitude,
              selectedProfessional.locations[0].longitude
            )
          }
        />
      )}
    </MapContainer>
  );
};

export default ProfessionalsListMap;
