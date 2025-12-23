'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Next.js
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
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import { supabase } from '@/lib/supabase';

// ... (DefaultIcon setup remains)

export default function MapComponent() {
    const [isMounted, setIsMounted] = useState(false);
    const [markers, setMarkers] = useState<any[]>([]);
    // Default center: Dakar, Senegal
    const defaultCenter: [number, number] = [14.6928, -17.4467];

    const [selectedCategory, setSelectedCategory] = useState<string>('Tout');

    const SERVICES = [
        'Tout', 'Plomberie', 'Électricité', 'Mécanique', 'Cuisine',
        'Bricolage', 'Transport', 'Couture', 'Coiffure', 'Commerçant', 'Santé', 'Éducation', 'Autres'
    ];

    useEffect(() => {
        setIsMounted(true);

        const fetchMarkers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_provider', true); // Only fetch Business Profiles

            if (data) {
                const mappedMarkers = data.map((profile: any) => ({
                    id: profile.id,
                    name: profile.business_name || profile.full_name || "Prestataire",
                    service: profile.service_category || "Service divers",
                    // Fallback to random position around Dakar if no coords (temporary fix for demo)
                    lat: profile.latitude || (14.6928 + (Math.random() - 0.5) * 0.05),
                    lng: profile.longitude || (-17.4467 + (Math.random() - 0.5) * 0.05),
                    price: profile.bio ? (profile.bio.length > 30 ? profile.bio.substring(0, 30) + '...' : profile.bio) : "Voir profil",
                    phone: profile.phone,
                    avatar_url: profile.avatar_url // Map avatar url
                }));
                setMarkers(mappedMarkers);
            }
        };

        fetchMarkers();
    }, []);

    const filteredMarkers = selectedCategory === 'Tout'
        ? markers
        : markers.filter(m => m.service === selectedCategory || (selectedCategory === 'Autres' && !SERVICES.includes(m.service)));

    if (!isMounted) {
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement de la carte...</div>;
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* Filter Dropdown - Moved down to avoid overlap with Search Bar */}
            <div style={{
                position: 'absolute',
                top: '140px', // moved down from 80px to clear the Search Bar (5rem)
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: '90%',
                maxWidth: '400px'
            }}>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '25px',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: 'var(--foreground)',
                        backgroundColor: 'var(--surface)',
                        appearance: 'none',
                        textAlign: 'center',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px top 50%',
                        backgroundSize: '12px auto'
                    }}
                >
                    {SERVICES.map(s => <option key={s} value={s}>{s === 'Tout' ? '🔍 Filtrer par métier' : s}</option>)}
                </select>
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false} // Custom zoom control position if needed
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredMarkers.map((marker) => {
                    // Custom Icon Logic
                    const hasAvatar = marker.avatar_url;
                    const customIcon = hasAvatar ? L.divIcon({
                        className: 'custom-avatar-icon',
                        html: `<div style="
                            width: 40px; 
                            height: 40px; 
                            background-image: url('${marker.avatar_url}');
                            background-size: cover;
                            background-position: center;
                            border-radius: 50%;
                            border: 2px solid white;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        "></div>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        popupAnchor: [0, -20]
                    }) : DefaultIcon;

                    return (
                        <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
                            <Popup>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {hasAvatar && <img src={marker.avatar_url} alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />}
                                    <div style={{ fontWeight: 'bold' }}>{marker.name}</div>
                                </div>
                                <div style={{ color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: '500' }}>{marker.service}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{marker.price}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>📞 {marker.phone}</div>
                                <button
                                    onClick={() => window.open(`tel:${marker.phone}`)}
                                    className="btn btn-primary"
                                    style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        width: '100%',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Appeler
                                </button>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Current User Marker (simulated) */}
                <Marker position={defaultCenter} icon={
                    L.divIcon({
                        className: 'user-marker',
                        html: '<div style="background-color: #1E40AF; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>'
                    })
                }>
                    <Popup>Vous êtes ici</Popup>
                </Marker>

            </MapContainer>
        </div>
    );
}
