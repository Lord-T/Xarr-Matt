'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    LayoutDashboard,
    Wallet,
    Crown,
    User,
    History,
    Settings,
    ArrowRight,
    TrendingUp,
    Star
} from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
                // Redirect non-providers to "Become Provider" page if they try to access dashboard
                // Or we can show a "Become Provider" CTA here.
                // For now, let's keep it open but show CTA.
            }
            setLoading(false);
        };
        getProfile();
    }, [router]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

    const isProvider = profile?.is_provider;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '90px' }}>

            {/* Header */}
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LayoutDashboard color="var(--primary)" /> Tableau de Bord
                </h1>
                <p style={{ color: '#64748B', marginTop: '0.25rem' }}>
                    Bonjour, {profile?.full_name?.split(' ')[0] || 'User'} 👋
                </p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Status Card */}
                {!isProvider ? (
                    <div style={{ backgroundColor: '#DBEAFE', padding: '1.5rem', borderRadius: '16px', border: '1px solid #93C5FD' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1E40AF', marginBottom: '0.5rem' }}>Devenez Prestataire !</h3>
                        <p style={{ color: '#1E3A8A', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Commencez à gagner de l'argent en proposant vos services sur Xarr-Matt.
                        </p>
                        <Link href="/become-provider" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563EB', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Créer mon Business <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Solde Rapide */}
                        <Link href="/wallet" style={{ textDecoration: 'none' }}>
                            <div style={{ backgroundColor: '#1E293B', color: 'white', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.85rem' }}>
                                    <Wallet size={16} /> Solde
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2 500 F</div>
                            </div>
                        </Link>

                        {/* Note / Performance */}
                        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem' }}>
                                <Star size={16} color="#F59E0B" /> Note Moyenne
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A' }}>4.8/5</div>
                        </div>
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#334155' }}>Accès Rapide</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>

                        <DashboardCard
                            icon={<User size={24} color="#2563EB" />}
                            title="Mon Profil"
                            desc="Gérer mes infos"
                            href="/profile"
                        />

                        <DashboardCard
                            icon={<Crown size={24} color="#F59E0B" />}
                            title="Premium"
                            desc="Booster ma visibilité"
                            href="/premium"
                            badge="PRO"
                        />

                        {isProvider && (
                            <>
                                <DashboardCard
                                    icon={<Wallet size={24} color="#10B981" />}
                                    title="Portefeuille"
                                    desc="Gérer mes gains"
                                    href="/wallet"
                                />
                                <DashboardCard
                                    icon={<History size={24} color="#6366F1" />}
                                    title="Activités"
                                    desc="Historique missions"
                                    href="/activities" // Assuming this page exists or will exist
                                />
                            </>
                        )}

                        <DashboardCard
                            icon={<Settings size={24} color="#64748B" />}
                            title="Paramètres"
                            desc="App & Sécurité"
                            href="/settings"
                        />

                    </div>
                </div>

            </div>

            <BottomNav />
        </div>
    );
}

function DashboardCard({ icon, title, desc, href, badge }: any) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', height: '100%', transition: 'transform 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {badge && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                        {badge}
                    </div>
                )}
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '0.95rem' }}>{title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{desc}</div>
                </div>
            </div>
        </Link>
    );
}
