'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/ui/TopBar';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamically import Map components to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import('react-leaflet').then((mod) => mod.CircleMarker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface HeatPoint {
    lat: number;
    lng: number;
    count: number;
}

export default function HeatmapPage() {
    const [points, setPoints] = useState<HeatPoint[]>([]);
    const [loading, setLoading] = useState(true);

    // Default: Dakar Center
    const center: [number, number] = [14.6928, -17.4467];

    useEffect(() => {
        const fetchHeatmap = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_demand_heatmap', {
                hours_lookback: 48 // Last 48h
            });

            if (data) {
                setPoints(data);
            }
            if (error) {
                console.error("Heatmap Error", error);
            }
            setLoading(false);
        };

        fetchHeatmap();
    }, []);

    const getColor = (count: number) => {
        if (count >= 5) return '#EF4444'; // Red (High)
        if (count >= 3) return '#F59E0B'; // Orange (Medium)
        return '#10B981'; // Green (Low)
    };

    const getRadius = (count: number) => {
        return Math.min(20, 5 + (count * 2)); // Scale radius
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Nav Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', zIndex: 20 }}>
                <Link href="/" style={{ color: 'var(--foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Zones de Demande (Heatmap)</h1>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Où sont les clients ces dernières 48h ?</span>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        Chargement des données...
                    </div>
                )}

                <MapContainer
                    center={center}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme for better heatmap contrast
                    />

                    {points.map((p, idx) => (
                        <CircleMarker
                            key={idx}
                            center={[p.lat, p.lng]}
                            radius={getRadius(p.count)}
                            pathOptions={{
                                fillColor: getColor(p.count),
                                color: getColor(p.count),
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.6
                            }}
                        >
                            <Popup>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold' }}>{p.count} Demandes</div>
                                    <div style={{ fontSize: '0.8rem' }}>Zone active</div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                </MapContainer>

                {/* Legend */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Légende</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '50%' }}></div> Fort
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div> Moyen
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '50%' }}></div> Faible
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
