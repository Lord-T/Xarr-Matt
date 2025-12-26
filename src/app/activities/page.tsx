'use client';

import React, { useState, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft, MapPin, XCircle, RotateCcw, Eye, Edit, User, Phone, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { RatingModal } from '@/components/ui/RatingModal';

export default function ActivitiesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

    // Fetch My Activities
    useEffect(() => {
        const fetchActivities = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles:accepted_by(full_name, rating, reviews_count)') // Fetch candidate profile
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setActivities(data);
            setLoading(false);
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (id: number) => {
        if (confirm("Voulez-vous vraiment annuler cette annonce ?")) {
            await supabase.from('posts').delete().eq('id', id);
            setActivities(prev => prev.filter(a => a.id !== id));
        }
    };

    // ADVERTISER ACTIONS: VALIDATION FLOW
    const handleApproveCandidate = async (postId: number, candidateName: string) => {
        if (confirm(`Valider le prestataire ${candidateName} ?\n\nCela va confirmer la mission et déclencher le paiement de sa commission.`)) {
            const { data, error } = await supabase.rpc('approve_mission', { p_post_id: postId });

            if (error) {
                alert("Erreur : " + error.message);
            } else {
                // @ts-ignore
                if (data && data.success === false) { alert("Echec: " + data.message); return; }

                alert(`✅ Prestataire validé ! La mission commence.`);
                // Force refresh
                window.location.reload();
            }
        }
    };

    const handleRejectCandidate = async (postId: number) => {
        if (confirm("Refuser cette candidature ?\nL'annonce sera remise en ligne pour d'autres prestataires.")) {
            const { error } = await supabase.rpc('reject_mission', { p_post_id: postId });
            if (!error) {
                alert("Candidature refusée.");
                window.location.reload();
            }
        }
    };

    const handleRefuse = async (id: number, providerId: string, price: number) => {
        // Implementation for post-acceptance refusal (Refund logic) - keeping existing logic scaffold
        if (confirm("Annuler ce prestataire ?")) {
            await supabase.from('posts').update({ status: 'available', accepted_by: null }).eq('id', id);
            setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'available', accepted_by: null } : a));
        }
    };

    const handleComplete = (id: number, providerId: string) => {
        setRatingTarget({ id, author: 'Prestataire' });
        setIsRatingModalOpen(true);
    };

    const handleRatingSubmit = async (rating: number, comment: string) => {
        if (ratingTarget) {
            console.log(`Rating ${rating} for ${ratingTarget.id}`);
            await supabase.from('posts').delete().eq('id', ratingTarget.id);
            setActivities(prev => prev.filter(a => a.id !== ratingTarget.id));
            setIsRatingModalOpen(false);
            setRatingTarget(null);
            alert("Merci ! Mission terminée et notée.");
        }
    };

    const ongoing = activities.filter(a => a.status !== 'completed'); // Show all active

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mes Annonces (Dashboard)</h1>
            </div>

            <div style={{ padding: '1rem', flex: 1 }}>
                {loading ? <p style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ongoing.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '2rem' }}>Aucune annonce active.</p>}

                        {ongoing.map(activity => (
                            <div key={activity.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: activity.status === 'pending_approval' ? '4px solid #F59E0B' : '4px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{activity.title}</div>

                                        {/* STATUS BADGES */}
                                        {activity.status === 'available' && <div style={{ fontSize: '0.85rem', color: '#64748B' }}>⏳ En ligne (Recherche...)</div>}
                                        {activity.status === 'pending_approval' && <div style={{ fontSize: '0.85rem', color: '#D97706', fontWeight: 700 }}>⚠️ 1 Candidature en attente !</div>}
                                        {activity.status === 'taken' && <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>✅ En cours (Prestataire validé)</div>}

                                    </div>
                                    <div style={{ fontSize: '1.25rem' }}>
                                        {activity.price ? `${activity.price} FCFA` : 'Sur devis'}
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MapPin size={14} /> {activity.location || 'Dakar'}
                                </div>

                                {/* CANDIDATE APPROVAL UI */}
                                {activity.status === 'pending_approval' && activity.profiles && (
                                    <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #FCD34D' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#B45309' }}>Candidat :</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', backgroundColor: '#FDE68A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {activity.profiles.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{activity.profiles.full_name || 'Prestataire'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#B45309' }}>⭐ {activity.profiles.rating || '5.0'} ({activity.profiles.reviews_count || 0} avis)</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button fullWidth onClick={() => handleApproveCandidate(activity.id, activity.profiles?.full_name)} style={{ backgroundColor: '#059669', color: 'white' }}>
                                                ✅ Valider
                                            </Button>
                                            <Button fullWidth onClick={() => handleRejectCandidate(activity.id)} variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                                                ❌ Refuser
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Standard Actions */}
                                {activity.status === 'taken' && (
                                    <Button fullWidth onClick={() => handleComplete(activity.id, "")} style={{ backgroundColor: '#10B981', color: 'white' }}>
                                        ✅ Travail Terminé
                                    </Button>
                                )}
                                {activity.status === 'available' && (
                                    <Button fullWidth onClick={() => handleCancel(activity.id)} style={{ backgroundColor: '#EF4444', color: 'white' }}>
                                        <XCircle size={16} style={{ marginRight: '0.5rem' }} /> Supprimer L'annonce
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                providerName="le Prestataire"
            />

            <BottomNav />
        </div>
    );
}
