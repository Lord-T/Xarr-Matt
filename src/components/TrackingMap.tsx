'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const providerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', // Scooter/Provider icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const clientIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // User/Home icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

export default function TrackingMap() {
    // Config: Dakar Plateau (Client) -> Medina (Provider Start)
    const clientPos: [number, number] = [14.6708, -17.4334];
    const startProviderPos: [number, number] = [14.681, -17.448];

    const [providerPos, setProviderPos] = useState<[number, number]>(startProviderPos);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate movement: Interpolate from Start to Client
        const interval = setInterval(() => {
            setProgress(old => {
                if (old >= 1) {
                    clearInterval(interval);
                    return 1;
                }
                return old + 0.005; // Speed of simulation
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Calculate new lat/lng based on progress
        const lat = startProviderPos[0] + (clientPos[0] - startProviderPos[0]) * progress;
        const lng = startProviderPos[1] + (clientPos[1] - startProviderPos[1]) * progress;
        setProviderPos([lat, lng]);
    }, [progress]);

    return (
        <MapContainer
            center={[14.675, -17.44]}
            zoom={14}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Client Marker */}
            <Marker position={clientPos} icon={clientIcon}>
                <Popup>Vous (Client) <br /> En attente...</Popup>
            </Marker>

            {/* Provider Marker */}
            <Marker position={providerPos} icon={providerIcon}>
                <Popup>
                    <div>
                        <strong>Prestataire</strong><br />
                        {progress < 1 ? 'En route...' : 'Arrivé !'}
                    </div>
                </Popup>
            </Marker>

            {/* Route Line */}
            <Polyline positions={[startProviderPos, clientPos]} color="blue" dashArray="10, 10" opacity={0.5} />

            {/* Active Route Part */}
            <Polyline positions={[startProviderPos, providerPos]} color="var(--primary)" weight={4} />

        </MapContainer>
    );
}
