'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet Icons (Next.js issue) - Run only on client
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Custom Icons
const UserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DestIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

interface TrackingMapProps {
    userLocation: [number, number];   // Me (Client)
    destination: [number, number];    // Job Site
    providerLocation?: [number, number]; // Moving Provider
}

const ProviderIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', // Orange for Provider
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export function TrackingMap({ userLocation, destination, providerLocation }: TrackingMapProps) {
    // Center map on Provider if available, else User
    const center = providerLocation || userLocation;

    return (
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Auto-Centering Effect */}
            <ChangeView center={center} />

            {/* User Position (Client) */}
            <Marker position={userLocation} icon={UserIcon}>
                <Popup>Vous (Client)</Popup>
            </Marker>

            {/* Destination (Job Site) */}
            <Marker position={destination} icon={DestIcon}>
                <Popup>Lieu de la mission</Popup>
            </Marker>

            {/* Moving Provider */}
            {providerLocation && (
                <Marker position={providerLocation} icon={ProviderIcon} zIndexOffset={1000}>
                    <Popup>Prestataire en route 🏎️</Popup>
                </Marker>
            )}

            {/* Route Guidelines */}
            {providerLocation ? (
                <Polyline positions={[providerLocation, destination]} color="orange" dashArray="5, 10" />
            ) : (
                <Polyline positions={[userLocation, destination]} color="blue" dashArray="5, 10" />
            )}
        </MapContainer>
    );
}
