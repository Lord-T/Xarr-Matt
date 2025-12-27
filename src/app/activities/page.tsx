'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft, MapPin, XCircle, RotateCcw, Eye, Edit, User, Phone, Star, Navigation, StopCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { RatingModal } from '@/components/ui/RatingModal';

export default function ActivitiesPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'client' | 'provider'>('client'); // 'client' = My Posts, 'provider' = My Missions

    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [myMissions, setMyMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

    // Tracking State
    const [trackingPostId, setTrackingPostId] = useState<string | number | null>(null);
    const watchIdRef = useRef<number | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }
            setCurrentUser(user);

            // 1. Fetch Posts I Created (Client Mode)
            const { data: postsData } = await supabase
                .from('posts')
                .select('*, profiles:accepted_by(full_name, rating, reviews_count)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (postsData) setMyPosts(postsData);

            // 2. Fetch Missions I Accepted (Provider Mode)
            const { data: missionsData } = await supabase
                .from('posts')
                .select('*') // We might want client profile info here too
                .eq('accepted_by', user.id)
                .order('created_at', { ascending: false });

            if (missionsData) setMyMissions(missionsData);

            setLoading(false);
        };

        fetchData();
        const interval = setInterval(fetchData, 8000); // Poll refresh
        return () => clearInterval(interval);
    }, []);

    // --- TRACKING LOGIC (PROVIDER) ---
    const startTracking = (postId: string | number) => {
        if (!navigator.geolocation) return alert("GPS non supporté");

        setTrackingPostId(postId);

        // Immediate update
        navigator.geolocation.getCurrentPosition(pos => updateLocation(postId, pos));

        // Watch
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => updateLocation(postId, pos),
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        alert("🛰️ Tracking activé ! Le client voit votre position.");
    };

    const stopTracking = async () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTrackingPostId(null);
        alert("🛑 Tracking arrêté.");
    };

    const updateLocation = async (postId: string | number, position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        // Upsert to tracking_sessions
        // Note: 'post_id' is Unique Primary Key, so upsert works fine.
        const { error } = await supabase.from('tracking_sessions').upsert({
            post_id: postId,
            provider_id: currentUser.id,
            lat: latitude,
            lng: longitude,
            last_updated: new Date().toISOString()
        });

        if (error) console.error("Tracking Error:", error);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);


    // --- CLIENT ACTIONS ---
    const handleCancel = async (id: number) => {
        if (confirm("Voulez-vous vraiment annuler cette annonce ?")) {
            await supabase.from('posts').delete().eq('id', id);
            setMyPosts(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleApproveCandidate = async (postId: number, candidateName: string) => {
        if (confirm(`Valider le prestataire ${candidateName} ?`)) {
            const { data, error } = await supabase.rpc('approve_mission', { p_post_id: postId });
            if (!error) window.location.reload();
        }
    };

    const handleRejectCandidate = async (postId: number) => {
        if (confirm("Refuser cette candidature ?")) {
            await supabase.rpc('reject_mission', { p_post_id: postId });
            window.location.reload();
        }
    };

    const handleComplete = (id: number, authorRole: 'client' | 'provider') => {
        // Only Client rates Provider usually
        if (authorRole === 'client') {
            setRatingTarget({ id, author: 'Prestataire' });
            setIsRatingModalOpen(true);
        } else {
            // Provider marking as done -> Just notifies client (simple alert for now)
            alert("Merci ! Le client a été notifié de la fin de mission.");
        }
    };

    const handleRatingSubmit = async (rating: number, comment: string) => {
        if (ratingTarget) {
            await supabase.from('posts').delete().eq('id', ratingTarget.id);
            setMyPosts(prev => prev.filter(a => a.id !== ratingTarget.id));
            setIsRatingModalOpen(false);
            setRatingTarget(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => router.back()} style={{ border: 'none', background: 'none' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mes Activités</h1>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderRadius: '12px', backgroundColor: '#F1F5F9', padding: '4px' }}>
                    <button
                        onClick={() => setViewMode('client')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', backgroundColor: viewMode === 'client' ? 'white' : 'transparent', boxShadow: viewMode === 'client' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all' }}
                    >
                        Je Demande 🙋‍♂️
                    </button>
                    <button
                        onClick={() => setViewMode('provider')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', backgroundColor: viewMode === 'provider' ? 'white' : 'transparent', boxShadow: viewMode === 'provider' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all' }}
                    >
                        Je Realise 👷
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem', flex: 1 }}>

                {/* --- CLIENT VIEW --- */}
                {viewMode === 'client' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myPosts.length === 0 && !loading && <p style={{ textAlign: 'center', color: '#94A3B8' }}>Aucune demande en cours.</p>}

                        {myPosts.map(activity => (
                            <div key={activity.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #3B82F6' }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{activity.title}</div>
                                <div style={{ marginBottom: '1rem' }}>
                                    {activity.status === 'available' && <span className="text-gray-500 text-sm">En attente de prestataire...</span>}
                                    {activity.status === 'pending_approval' && <span className="text-orange-500 font-bold text-sm">Validation requise !</span>}
                                    {activity.status === 'taken' && <span className="text-green-600 font-bold text-sm">En cours...</span>}
                                </div>

                                {/* Validation UI */}
                                {activity.status === 'pending_approval' && activity.profiles && (
                                    <div className="bg-orange-50 p-3 rounded-lg mb-3 border border-orange-100">
                                        <div className="font-bold mb-2">Candidat : {activity.profiles.full_name}</div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleApproveCandidate(activity.id, activity.profiles.full_name)}>Valider</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleRejectCandidate(activity.id)}>Refuser</Button>
                                        </div>
                                    </div>
                                )}

                                {/* Tracking Client Side */}
                                {activity.status === 'taken' && (
                                    <div className="mb-3">
                                        <Button fullWidth variant="secondary" onClick={() => router.push(`/tracking?id=${activity.id}`)}>
                                            🌍 Suivre le prestataire
                                        </Button>
                                    </div>
                                )}

                                {activity.status === 'taken' && (
                                    <Button fullWidth onClick={() => handleComplete(activity.id, 'client')} style={{ backgroundColor: '#10B981', color: 'white' }}>
                                        ✅ Terminer & Noter
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PROVIDER VIEW --- */}
                {viewMode === 'provider' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myMissions.length === 0 && !loading && <p style={{ textAlign: 'center', color: '#94A3B8' }}>Aucune mission acceptée.</p>}

                        {myMissions.map(mission => (
                            <div key={mission.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981' }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{mission.title}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem' }}>Client : Anonyme (Voir détails)</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Button variant="outline" onClick={() => window.open(`tel:${mission.contact_phone || ''}`)}>
                                        📞 Appeler
                                    </Button>
                                    <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mission.lat || 14.7},${mission.lng || -17.4}`)}>
                                        📍 Y Aller
                                    </Button>
                                </div>

                                {/* TRACKING CONTROLS */}
                                {mission.status === 'taken' && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center mb-3">
                                        <div className="text-sm text-slate-500 mb-2">Partage de position</div>
                                        {trackingPostId === mission.id ? (
                                            <Button fullWidth onClick={stopTracking} style={{ backgroundColor: '#EF4444', color: 'white' }} className="animate-pulse">
                                                <StopCircle size={18} className="mr-2" /> Arrêter le Tracking
                                            </Button>
                                        ) : (
                                            <Button fullWidth onClick={() => startTracking(mission.id)} style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                                                <Navigation size={18} className="mr-2" /> Activer GPS Live
                                            </Button>
                                        )}
                                    </div>
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
