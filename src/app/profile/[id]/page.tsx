'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Clock, MapPin, Phone, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const profileId = params?.id as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileId) return;

        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (data) setProfile(data);
            if (error) console.error(error);
            setLoading(false);
        };

        fetchProfile();
    }, [profileId]);

    const handleBack = () => router.back();

    if (loading) return <div className="p-8 text-center">Chargement du profil...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profil introuvable.</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <button onClick={handleBack} style={{ border: 'none', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Profil Prestataire</h1>
            </div>

            <div className="container" style={{ padding: '1rem' }}>

                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E2E8F0', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748B' }}>
                        {profile.full_name?.charAt(0) || <User size={40} />}
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{profile.full_name || 'Utilisateur'}</h2>
                    <div style={{ color: '#64748B', marginBottom: '1rem' }}>{profile.profession || 'Prestataire Xarr-Matt'}</div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#FEF9C3', color: '#854D0E', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Star size={14} fill="#854D0E" /> {profile.rating?.toFixed(1) || 'Nouveau'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.9rem' }}>
                            {profile.reviews_count || 0} avis
                        </div>
                    </div>

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {profile.bio && (
                            <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#334155' }}>
                                "{profile.bio}"
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                            <MapPin size={18} />
                            <span>{profile.city || 'Dakar'}, {profile.neighborhood || 'Sénégal'}</span>
                        </div>

                        {/* PHONE IS HIDDEN UNTIL VALIDATED - Using dummy text or masked for now per rules */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94A3B8' }}>
                            <Phone size={18} />
                            <span>Numéro masqué (Validez la mission pour voir)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                            <Clock size={18} />
                            <span>Membre depuis {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Section Placeholder */}
                <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', paddingLeft: '0.5rem' }}>Avis récents</h3>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>
                        Aucun avis pour le moment.
                    </div>
                </div>

            </div>
        </div>
    );
}
