'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Globe, Bell } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
                <Link href="/" style={{ color: 'var(--foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Paramètres</h1>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Theme */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Moon size={24} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Mode Sombre</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Bientôt disponible</div>
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '24px', backgroundColor: '#E5E7EB', borderRadius: '12px' }}></div>
                </div>

                {/* Notifications */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Bell size={24} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Notifications</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Activer les alertes</div>
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '24px', backgroundColor: '#10B981', borderRadius: '12px', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: '2px', top: '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                    </div>
                </div>

                {/* Langue */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Globe size={24} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Langue</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Français (Défaut)</div>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '2rem' }}>
                    Xarr-Matt v1.0.0<br />
                    Made with ❤️ in Senegal
                </div>
            </div>
        </div>
    );
}
