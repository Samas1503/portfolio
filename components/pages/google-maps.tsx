"use client";

import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: -24.185808088573562,
  lng: -65.29946537558496,
};

type Props = {
  value?: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
};

export default function GoogleMaps({ value, onLocationChange }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedPosition, setSelectedPosition] = useState(
    value || defaultCenter
  );

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedPosition(newPos);
      onLocationChange?.(newPos); // Notifica al formulario
    }
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedPosition}
      zoom={17}
      onClick={handleMapClick}
    >
      <Marker position={selectedPosition} />
    </GoogleMap>
  );
}
