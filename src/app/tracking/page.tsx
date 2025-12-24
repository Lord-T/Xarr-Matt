'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Navigation, MapPin, User } from 'lucide-react';

// Dynamic Import for Map (No SSR)
const TrackingMapWithNoSSR = dynamic(
    () => import('@/components/TrackingMap').then((mod) => mod.TrackingMap),
    { ssr: false }
);

function TrackingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const postId = searchParams.get('id');

    const [post, setPost] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Get User Location (Provider)
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            },
            (err) => {
                console.error("Erreur GPS:", err);
                // Don't block, just keep waiting or show weak signal warning
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 2. Fetch Post Details (Destination)
    useEffect(() => {
        if (!postId) return;

        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (data) {
                // Fallback for missing coordinates in DB
                let finalLat = data.lat;
                let finalLng = data.lng;

                // Try parsing location string "lat,lng" if columns are null
                if (!finalLat && data.location && data.location.includes(',')) {
                    const parts = data.location.split(',');
                    if (parts.length === 2) {
                        finalLat = parseFloat(parts[0]);
                        finalLng = parseFloat(parts[1]);
                    }
                }

                setPost({ ...data, lat: finalLat, lng: finalLng });
            }
            setLoading(false);
        };

        fetchPost();
    }, [postId]);

    const handleOpenGoogleMaps = () => {
        if (post?.lat && post?.lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lng}`, '_blank');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement de la mission...</div>;
    if (!post) return <div style={{ padding: '2rem', textAlign: 'center' }}>Mission introuvable.</div>;

    const destination: [number, number] = [post.lat || 14.7167, post.lng || -17.4677];

    return (
        <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: '1rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
            }}>
                <Button variant="outline" onClick={() => router.back()} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Retour
                </Button>
                <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{post.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                        <User size={16} /> {post.author_name || 'Client'}
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {userLocation ? (
                    <TrackingMapWithNoSSR
                        userLocation={userLocation}
                        destination={destination}
                    />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div className="spinner" style={{ marginBottom: '1rem' }}>📡</div>
                            <p>Recherche du signal GPS...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info Card */}
            <div style={{
                padding: '1.5rem', backgroundColor: 'white',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
                borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>DISTANCE RESTANTE</div>
                        {/* Note: In a real app we'd calculate this from the route. For now, visual estimation lines are drawn. */}
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>En route...</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>DESTINATION</div>
                        <div style={{ fontWeight: 600 }}>{post.location || 'Coordonnées GPS'}</div>
                    </div>
                </div>

                <Button fullWidth onClick={handleOpenGoogleMaps} variant="outline">
                    <MapPin size={18} style={{ marginRight: '0.5rem' }} /> Ouvrir Google Maps (Secours)
                </Button>
            </div>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <TrackingContent />
        </Suspense>
    );
}
