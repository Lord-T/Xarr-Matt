'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Filter, Podcast, Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import { TopBar } from '@/components/ui/TopBar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter(); // For redirects
    const [ads, setAds] = useState<FeedItemProps[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // Rating Logic State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: string | number, author: string } | null>(null);

    // Business Logic: Provider Wallet Balance (Real)
    const [providerBalance, setProviderBalance] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    // Dynamic Settings
    const [commissionConfig, setCommissionConfig] = useState<{ rate: number, fixed_fallback: number }>({ rate: 10, fixed_fallback: 500 });

    const [viewerLocation, setViewerLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Candidate Management State
    const [candidateModalOpen, setCandidateModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // Haversine Distance Helper
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setViewerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Loc Error", err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // 1. Fetch Data (Dependent on Location for Geo-Restriction)
    useEffect(() => {
        const initData = async () => {
            // Wait for location if we want to enforce 7km restriction
            // If location is denied or unavailable, we might show nothing or a prompt (User Requirement: "n'accédent pas")
            if (!viewerLocation) return;

            setLoading(true);

            // A. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
                if (profile) setProviderBalance(profile.balance || 0);
            }

            // B. Fetch Settings
            const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'commission_config').single();
            if (settings?.value) setCommissionConfig(settings.value);

            // C. Fetch GEO-RESTRICTED Ads from Supabase (RPC)
            // Using the strict 7km server-side filter
            console.log("Fetching posts nearby...", viewerLocation);

            const { data: posts, error } = await supabase.rpc('get_posts_nearby', {
                user_lat: viewerLocation.lat,
                user_lng: viewerLocation.lng,
                radius_km: 7.0 // Strict 7km limit
            });

            if (error) {
                console.error("Feed error:", error);
            }

            if (posts) {
                // Map RPC result to UI format
                const formattedAds = posts.map((p: any) => {
                    return {
                        id: p.id,
                        author: p.author_full_name || 'Anonyme',
                        service: p.title,
                        description: p.description,
                        price: p.price ? p.price.toString() : 'Sur devis',
                        distance: parseFloat(p.distance_km.toFixed(1)), // Calculated by DB
                        timestamp: new Date(p.created_at).toLocaleDateString(),
                        locationName: p.location || 'Dakar',
                        lat: p.lat || 14.692,
                        lng: p.lng || -17.446,
                        status: p.status,
                        phoneNumber: p.contact_phone,
                        audioUrl: p.audio_url,
                        user_id: p.user_id,
                        rawPrice: p.rawPrice, // Maps to "rawPrice" from RPC
                        isUrgent: p.is_urgent, // New Urgency Mapped
                        myApplicationStatus: p.my_application_status // NEW: Mapped from RPC
                    };
                });
                setAds(formattedAds);
            }
            setLoading(false);
        };

        // Realtime Subscription
        const settingsSub = supabase
            .channel('app_settings_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'key=eq.commission_config' },
                (payload) => {
                    if (payload.new?.value) {
                        setCommissionConfig(payload.new.value);
                    }
                })
            .subscribe();

        initData();

        return () => { supabase.removeChannel(settingsSub); };
    }, [viewerLocation]); // Re-run when location is acquired or changes

    // 1. PROVIDER: Apply for Mission
    const handleApply = async (id: string | number) => {
        if (!userId) { router.push('/login'); return; }

        // Optimistic Update can be added here if needed, but we rely on RPC return usually or refresh

        try {
            const { data: result, error } = await supabase.rpc('apply_for_mission', {
                p_provider_id: userId,
                p_post_id: id
            });

            if (error || (result && !result.success)) {
                alert("Erreur: " + (error?.message || result?.message));
            } else {
                // Success: Refresh to show "En attente" badge
                alert("✅ Candidature envoyée ! Attendez la réponse du client.");
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            alert("Erreur système.");
        }
    };

    // 2. AUTHOR: View Candidates
    const handleViewCandidates = async (postId: string | number) => {
        setSelectedPostId(String(postId));
        setCandidateModalOpen(true);
        setLoadingCandidates(true);

        const { data, error } = await supabase.rpc('get_post_applications', { p_post_id: postId });
        if (data) setCandidates(data);
        if (error) console.error(error);

        setLoadingCandidates(false);
    };

    // 3. AUTHOR: Approve Provider
    const handleApproveProvider = async (providerId: string, fee: number) => {
        if (!selectedPostId || !userId) return;

        if (confirm(`Valider ce prestataire ?\n\nCela débitera ${fee} FCFA de SON solde et la mission commencera.`)) {
            const { data: result, error } = await supabase.rpc('approve_provider', {
                p_post_id: selectedPostId,
                p_provider_id: providerId,
                p_fee: fee
            });

            if (error || (result && !result.success)) {
                alert("Erreur: " + (error?.message || result?.message));
            } else {
                alert("✅ Prestataire validé !");
                setCandidateModalOpen(false);
                // Refresh feed to show accepted status
                window.location.reload();
            }
        }
    };

    // Removed legacy reject (implicit by approving another)
    // The previous handleApprove is also removed as it's replaced by handleApproveProvider
    const handleApprove = undefined;

    // 3. Client Rejects (Author) - V2
    const handleReject = async (id: number) => {
        if (!userId) return;
        if (confirm("Refuser ce candidat ?\nL'annonce sera remise en ligne pour d'autres prestataires.")) {
            // Optimistic
            setAds(current => current.map(ad => ad.id === id ? { ...ad, status: 'available', accepted_by: undefined } : ad));

            const { data: result, error } = await supabase.rpc('reject_mission_v2', { p_post_id: id, p_client_id: userId });
            if (error) alert("Erreur: " + error.message);
        }
    };

    const handleComplete = (id: string | number) => {
        const item = ads.find(a => a.id === id);
        if (item) {
            setRatingTarget({ id: item.id, author: item.author });
            setIsRatingModalOpen(true);
        }
    };

    const handleRatingSubmit = (rating: number, comment: string) => {
        console.log("Rated", rating, comment);
        setIsRatingModalOpen(false);
        alert("Merci pour votre avis !");
    };

    // Sorting and Filtering Logic
    const filteredAds = useMemo(() => {
        let filtered = [...ads];
        if (category !== 'all') {
            filtered = filtered.filter(ad => ad.service.toLowerCase().includes(category));
        }
        if (searchTerm) {
            filtered = filtered.filter(ad =>
                ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ad.service.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        filtered.sort((a, b) => a.distance - b.distance);
        return filtered;
    }, [ads, searchTerm, category]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', position: 'relative', paddingTop: '80px' }}>

            <TopBar />

            {/* Header & Filter */}
            <div style={{ padding: '0 1rem 1rem 1rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        backgroundColor: 'var(--input)', borderRadius: 'var(--radius)', padding: '0 0.5rem'
                    }}>
                        <Search size={18} color="var(--muted)" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="input"
                            style={{ border: 'none', background: 'transparent' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {['all', 'mecanique', 'bricolage', 'cuisine', 'transport'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                border: category === cat ? 'none' : '1px solid var(--border)',
                                backgroundColor: category === cat ? 'var(--primary)' : 'white',
                                color: category === cat ? 'white' : 'var(--foreground)',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat === 'all' ? 'Tout' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed List */}
            <div className="container" style={{ padding: '1rem' }}>
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Chargement des annonces...</div>
                ) : filteredAds.length > 0 ? (
                    filteredAds.map(ad => (
                        <FeedItem
                            key={ad.id}
                            item={ad}
                            currentUserId={userId || undefined}
                            onApply={handleApply}
                            onManageCandidates={handleViewCandidates}
                            onComplete={handleComplete}
                        />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                        Aucune annonce disponible.
                    </div>
                )}
            </div>

            {/* Candidate Management Modal */}
            {candidateModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            Candidatures
                            <button onClick={() => setCandidateModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem' }}>×</button>
                        </h3>

                        {loadingCandidates ? (
                            <div className="text-center py-4">Chargement...</div>
                        ) : candidates.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Aucune candidature pour le moment.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {candidates.map(c => (
                                    <div key={c.id} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {c.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{c.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'gold' }}>★ {c.rating ? c.rating.toFixed(1) : 'NEW'} ({c.reviews_count} avis)</div>
                                            </div>
                                        </div>

                                        {c.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    // Calculate fee logic reuse
                                                    const ad = ads.find(a => String(a.id) === selectedPostId);
                                                    let fee = 500;
                                                    if (ad && ad.rawPrice) fee = Math.floor(ad.rawPrice * 0.10);
                                                    else if (ad && ad.price) {
                                                        const clean = String(ad.price).replace(/[^\d]/g, '');
                                                        if (clean) fee = Math.floor(parseInt(clean) * 0.10);
                                                    }
                                                    if (fee < 100) fee = 100;

                                                    handleApproveProvider(c.provider_id, fee);
                                                }}
                                                style={{
                                                    width: '100%', padding: '0.5rem',
                                                    backgroundColor: '#10B981', color: 'white',
                                                    border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
                                                }}
                                            >
                                                ✅ Accepter (Com: {500} FCFA~)
                                            </button>
                                        )}
                                        {c.status === 'accepted' && (
                                            <div style={{ color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>Validé</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                providerName={ratingTarget?.author || 'Prestataire'}
            />

            <BottomNav />
        </div>
    );
}
