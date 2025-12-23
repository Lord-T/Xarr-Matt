'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Building, Phone, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
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

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        };
        getProfile();
    }, [router]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
                <Link href="/" style={{ color: 'var(--foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Mon Profil</h1>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Avatar & Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                        {profile?.full_name?.[0] || 'U'}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profile?.full_name || 'Utilisateur'}</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>{profile?.phone}</p>
                </div>

                {/* Status Business */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={20} className="text-primary" /> Espace Business
                        </h3>
                        <Link href="/become-provider" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Edit size={16} /> Modifier
                        </Link>
                    </div>

                    {profile?.is_provider ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Nom :</span>
                                <span style={{ fontWeight: 600 }}>{profile.business_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Activité :</span>
                                <span style={{ fontWeight: 600 }}>{profile.service_category}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Statut Carte :</span>
                                <span style={{ color: '#16A34A', fontWeight: 'bold' }}>Visible 🟢</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                            <p style={{ marginBottom: '1rem' }}>Vous n'avez pas encore activé votre profil prestataire.</p>
                            <Link href="/become-provider" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', backgroundColor: 'var(--primary)', color: 'white' }}>
                                Créer mon Business
                            </Link>
                        </div>
                    )}
                </div>

                {/* Settings Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--muted-foreground)' }}>Compte</h3>

                    <Link href="/settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                        <span>Paramètres de l'application</span>
                        <span>👉</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
