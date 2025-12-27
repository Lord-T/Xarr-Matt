'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Rocket, Clock, AlertTriangle } from 'lucide-react';

export function BoostCard() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [buying, setBuying] = useState(false);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('balance, boosted_until, is_provider')
                .eq('id', user.id)
                .single();
            setProfile(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleBuyBoost = async () => {
        if (!confirm("Confirmez-vous l'achat du Booster (48h) pour 3000 FCFA ?")) return;

        setBuying(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non connecté");

            const { error } = await supabase.rpc('purchase_boost', {
                p_user_id: user.id
            });

            if (error) throw error;

            alert("🚀 Profil Boosté avec succès !");
            fetchProfile(); // Refresh
        } catch (err: any) {
            alert("Erreur : " + (err.message || "Solde insuffisant"));
        } finally {
            setBuying(false);
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (!profile || !profile.is_provider) return null; // Only for providers

    const isBoosted = profile.boosted_until && new Date(profile.boosted_until) > new Date();
    const timeLeft = isBoosted
        ? Math.ceil((new Date(profile.boosted_until).getTime() - Date.now()) / (1000 * 60 * 60))
        : 0;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.2)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                    padding: '10px',
                    backgroundColor: '#F59E0B',
                    borderRadius: '50%',
                    color: 'white'
                }}>
                    <Rocket size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: '#92400E', fontSize: '1.1rem' }}>Booster de Visibilité</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#B45309' }}>Apparaissez en premier sur la carte !</p>
                </div>
            </div>

            {isBoosted ? (
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#059669', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> Actif pour encore {timeLeft}h
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Votre profil brille en or 👑</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <span>Coût : <strong>1000 FCFA</strong></span>
                        <span>Durée : <strong>48 Heures</strong></span>
                    </div>

                    <Button
                        fullWidth
                        onClick={handleBuyBoost}
                        disabled={buying || profile.balance < 1000}
                        style={{ backgroundColor: '#F59E0B', border: 'none' }}
                    >
                        {buying ? 'Activation...' : 'ACTIVER LE BOOSTER 🚀'}
                    </Button>

                    {profile.balance < 1000 && (
                        <p style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={14} /> Solde insuffisant ({profile.balance} F). Rechargez !
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
