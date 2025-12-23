'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Home, Search, PlusCircle, CreditCard, User, Bell } from 'lucide-react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';

// Dynamically import Map to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <p>Chargement de la carte...</p>
});

import { TopBar } from '@/components/ui/TopBar';

export default function MapPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            <TopBar />

            {/* Floating Search Bar (Below TopBar) */}
            <div style={{
                position: 'absolute',
                top: '5rem',
                left: '1rem',
                right: '1rem',
                zIndex: 999,
            }}>
                <div style={{
                    backgroundColor: 'var(--surface)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Search size={18} color="var(--muted)" />
                    <input
                        type="text"
                        placeholder="Que cherchez-vous ?"
                        style={{ border: 'none', background: 'transparent', padding: '0.2rem', width: '100%', outline: 'none', color: 'var(--foreground)' }}
                    />
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <MapWithNoSSR />
            </div>

            {/* SOS Trigger */}
            <Link href="/sos" style={{ position: 'absolute', bottom: '85px', right: '1rem', zIndex: 1000, width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.2), 0 0 0 4px rgba(255,255,255,0.8)', textDecoration: 'none', animation: 'bounce 2s infinite' }}>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', fontFamily: 'sans-serif' }}>SOS</div>
            </Link>

            {/* Bottom Navigation (Shared Component) */}
            <BottomNav />
        </div>
    );
}


