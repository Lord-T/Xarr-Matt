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
    const [providerLocation, setProviderLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ... (GPS Logic stays the same) ...

    // 3. REALTIME TRACKING SUBSCRIPTION
    useEffect(() => {
        if (!postId) return;

        // Initial Fetch of last known location
        const fetchLastLocation = async () => {
            const { data } = await supabase.from('tracking_sessions').select('*').eq('post_id', postId).single();
            if (data && data.lat && data.lng) {
                setProviderLocation([data.lat, data.lng]);
            }
        };
        fetchLastLocation();

        // Subscribe to Live Updates
        const channel = supabase
            .channel(`tracking_${postId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tracking_sessions', filter: `post_id=eq.${postId}` },
                (payload) => {
                    if (payload.new.lat && payload.new.lng) {
                        setProviderLocation([payload.new.lat, payload.new.lng]);
                    }
                }
            )
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'tracking_sessions', filter: `post_id=eq.${postId}` },
                (payload) => {
                    if (payload.new.lat && payload.new.lng) {
                        setProviderLocation([payload.new.lat, payload.new.lng]);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [postId]);

    // ... (Rest of fetchPost logic) ...

    // ... (In Render) ...
    {
        userLocation ? (
            <TrackingMapWithNoSSR
                userLocation={userLocation}
                destination={destination}
                providerLocation={providerLocation || undefined}
            />
        ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}>📡</div>
                    <p>Recherche du signal GPS...</p>
                </div>
            </div>
        )
    }
            </div >

        {/* Bottom Info Card */ }
        < div style = {{
        padding: '1.5rem', backgroundColor: 'white',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
                borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
    }
}>
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
            </div >
        </div >
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <TrackingContent />
        </Suspense>
    );
}
