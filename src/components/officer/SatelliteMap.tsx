"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Leaflet
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = icon;

interface SatelliteMapProps {
    showNDVI?: boolean;
    showSoilMoisture?: boolean;
    showWeatherEvents?: boolean;
}

export default function SatelliteMap({
    showNDVI,
    showSoilMoisture,
    showWeatherEvents
}: SatelliteMapProps) {
    // Sample farm location (Nashik, Maharashtra)
    const farmCenter: [number, number] = [19.9975, 73.7898];

    // Sample farm boundary polygon
    const farmBoundary: [number, number][] = [
        [19.9990, 73.7880],
        [19.9990, 73.7920],
        [19.9960, 73.7920],
        [19.9960, 73.7880],
    ];

    return (
        <MapContainer
            center={farmCenter}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
        >
            {/* Satellite View from Esri */}
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                maxZoom={19}
            />

            {/* Overlay labels for better readability */}
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />

            {/* Farm Boundary */}
            <Polygon
                positions={farmBoundary}
                pathOptions={{
                    color: '#fbbf24',
                    weight: 3,
                    dashArray: '10, 10',
                    fillColor: 'transparent'
                }}
            />

            {/* Farm Center Marker */}
            <Marker position={farmCenter}>
                <Popup>
                    <div className="text-sm">
                        <strong>Farm Location</strong>
                        <br />
                        Nashik, Maharashtra
                        <br />
                        Area: 2.5 Acres
                    </div>
                </Popup>
            </Marker>

            {/* NDVI Legend */}
            {showNDVI && (
                <div className="leaflet-bottom leaflet-left" style={{ marginLeft: '10px', marginBottom: '50px' }}>
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-semibold mb-2">NDVI</p>
                        <div
                            className="w-32 h-3 rounded"
                            style={{
                                background: 'linear-gradient(90deg, hsl(0, 70%, 55%), hsl(45, 90%, 55%), hsl(142, 60%, 45%))'
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Soil Moisture Legend */}
            {showSoilMoisture && (
                <div className="leaflet-bottom leaflet-right" style={{ marginRight: '10px', marginBottom: '50px' }}>
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-semibold mb-2">Soil Moisture</p>
                        <div
                            className="w-32 h-3 rounded"
                            style={{
                                background: 'linear-gradient(90deg, hsl(0, 70%, 55%), hsl(45, 90%, 55%), hsl(200, 80%, 55%))'
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Dry</span>
                            <span>Wet</span>
                        </div>
                    </div>
                </div>
            )}
        </MapContainer>
    );
}
