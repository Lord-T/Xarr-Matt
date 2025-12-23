'use client';

import React, { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function TopBar() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none' // Let clicks pass through empty spaces
        }}>
            {/* Burger Menu Button */}
            <button
                onClick={() => setIsMenuOpen(true)}
                style={{
                    width: '44px', height: '44px',
                    backgroundColor: 'var(--surface)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer',
                    border: 'none', pointerEvents: 'auto', color: 'var(--foreground)'
                }}
            >
                <Menu size={24} />
            </button>

            {/* Notif */}
            <Link href="/notifications" style={{
                width: '44px', height: '44px',
                backgroundColor: 'var(--surface)', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                position: 'relative', textDecoration: 'none', color: 'var(--foreground)',
                pointerEvents: 'auto'
            }}>
                <Bell size={24} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', border: '1px solid white' }}></div>
            </Link>

            {/* Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, pointerEvents: 'auto'
                    }}
                />
            )}

            {/* Sidebar Content */}
            <div style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
                backgroundColor: 'var(--background)', zIndex: 2001,
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                padding: '2rem 1.5rem',
                display: 'flex', flexDirection: 'column', gap: '2rem',
                pointerEvents: 'auto'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Xarr-Matt</div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Link href="/" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '1.1rem' }}>
                        🏠 Accueil
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '1.1rem' }}>
                        📊 Tableau de Bord (Espace Pro)
                    </Link>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '1.1rem' }}>
                        👤 Mon Profil
                    </Link>
                    <Link href="/settings" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '1.1rem' }}>
                        ⚙️ Paramètres
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        🚪 Déconnexion
                    </button>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>Version 1.0.0</div>
                </div>
            </div>
        </div>
    );
}
