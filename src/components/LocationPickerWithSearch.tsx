// src/components/LocationPickerWithSearch.tsx

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder";

// Este componente hijo se encarga de añadir el control de búsqueda al mapa
const GeocoderControl = ({
  onLocationSelect,
}: {
  onLocationSelect: (data: any) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true, // Pone un marcador automáticamente en la ubicación encontrada
      placeholder: "Busca la dirección de tu local...",
      errorMessage: "No se encontró la dirección.",
    })
      .on("markgeocode", function (e) {
        const { center, name } = e.geocode;
        // Cuando se selecciona una ubicación, llamamos a la función que nos pasó el componente padre
        onLocationSelect({
          address: name,
          latitude: center.lat,
          longitude: center.lng,
        });
        map.fitBounds(e.geocode.bbox); // Centra y hace zoom en la ubicación encontrada
      })
      .addTo(map);

    // Limpieza: elimina el control cuando el componente se desmonte
    return () => {
      map.removeControl(geocoder);
    };
  }, [map, onLocationSelect]);

  return null;
};

// Componente principal que exportaremos
const LocationPickerWithSearch = ({
  onLocationSelect,
}: {
  onLocationSelect: (data: any) => void;
}) => {
  return (
    <MapContainer
      center={[-34.6037, -58.3816]} // Centrado inicial en Buenos Aires
      zoom={12}
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <GeocoderControl onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
};

export default LocationPickerWithSearch;
