'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Globe, Bell } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/lib/supabase';
import { ShieldCheck } from 'lucide-react';
import { BoostCard } from '@/components/BoostCard';

// Sub-component for Admin Check to keep main clean
function AdminAccessLink() {
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 'ahmadoumanelfall@gmail.com') {
                setIsAdmin(true);
            }
        };
        check();
    }, []);

    if (!isAdmin) return null;

    return (
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '1rem',
                borderRadius: '12px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                        <ShieldCheck size={24} color="#10B981" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Espace Administrateur</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Gérer Xarr-Matt</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { permission, subscribe } = usePushNotifications();
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

                {/* Booster / Monetization */}
                <BoostCard />

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
                        <Bell size={24} color={permission === 'granted' ? 'var(--primary)' : 'black'} fill={permission === 'granted' ? 'var(--primary)' : 'none'} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Notifications Push</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {permission === 'granted' ? 'Activées' : 'Recevoir les alertes'}
                            </div>
                        </div>
                    </div>
                    {permission !== 'granted' && (
                        <button onClick={subscribe} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Activer
                        </button>
                    )}
                    {permission === 'granted' && (
                        <div style={{ width: '48px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '99px', position: 'relative' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '26px' }} />
                        </div>
                    )}
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

                {/* --- ADMIN ACCESS (Hidden for others) --- */}
                <AdminAccessLink />

                <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '2rem' }}>
                    Xarr-Matt v1.0.0<br />
                    Made with ❤️ in Senegal
                </div>
            </div>
        </div>
    );
}
