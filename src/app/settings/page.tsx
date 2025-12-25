'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Globe, Bell } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
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

                {/* ID Verification Link */}
                <Link href="/verification" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.8rem' }}>ID</div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Documents d'identification</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Badge Vérifié</div>
                            </div>
                        </div>
                        <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Non Vérifié</div>
                    </div>
                </Link>

                {/* Theme Toggle */}
                <div
                    onClick={toggleTheme}
                    style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Moon size={24} color={theme === 'dark' ? 'var(--primary)' : 'black'} fill={theme === 'dark' ? 'var(--primary)' : 'none'} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Mode Sombre</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{theme === 'dark' ? 'Activé' : 'Désactivé'}</div>
                        </div>
                    </div>
                    <div style={{
                        width: '48px', height: '24px',
                        backgroundColor: theme === 'dark' ? 'var(--primary)' : '#E5E7EB',
                        borderRadius: '99px', position: 'relative', transition: 'background-color 0.2s'
                    }}>
                        <div style={{
                            width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '2px', left: theme === 'dark' ? '26px' : '2px',
                            transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                    </div>
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
