'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/ui/BottomNav';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamically import TrackingMap to avoid SSR issues
const TrackingMapWithNoSSR = dynamic(() => import('@/components/TrackingMap'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement de la carte...</div>
});

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TrackingPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setIsAuthorized(true);
            }
        };
        checkAccess();
    }, [router]);

    if (!isAuthorized) return <div style={{ padding: '2rem', textAlign: 'center' }}>Vérification des droits d'accès...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Header Info */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Suivi de commande</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            MF
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Modou Fall</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Mécanicien • ⭐ 4.8</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                            <Phone size={20} color="var(--success)" />
                        </button>
                        <button style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                            <MessageCircle size={20} color="var(--primary)" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <TrackingMapWithNoSSR />

                {/* Estimated Time Overlay */}
                <div style={{
                    position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1000, fontWeight: 600, fontSize: '0.9rem'
                }}>
                    Arrivée estimée: 5 min
                </div>
            </div>

            {/* Bottom Status Panel */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius)' }}>
                    <ShieldCheck size={20} color="#0284C7" />
                    <div style={{ fontSize: '0.85rem', color: '#0369A1' }}>
                        Code de sécurité: <strong>8824</strong> (A donner à l'arrivée)
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
