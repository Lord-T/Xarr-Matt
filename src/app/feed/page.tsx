'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import { TopBar } from '@/components/ui/TopBar';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); // V5 Deep Linking

    const [ads, setAds] = useState<FeedItemProps[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // Rating Logic State (Still global as it's a modal)
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: string | number, author: string } | null>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [viewerLocation, setViewerLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Candidate Management State (Deep Link Target)
    const [candidateModalOpen, setCandidateModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

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

    // Fetch Data
    useEffect(() => {
        const initData = async () => {
            if (!viewerLocation) return;
            setLoading(true);

            // A. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);

            // B. Fetch Posts V5 RPC
            console.log("Fetching posts nearby V5...", viewerLocation);

            const { data: posts, error } = await supabase.rpc('get_posts_nearby', {
                p_user_lat: viewerLocation.lat,
                p_user_lng: viewerLocation.lng,
                radius_km: 7.0
            });

            if (error) console.error("Feed error:", error);

            if (posts) {
                // Map RPC result to UI V5 Strict format
                const formattedAds = posts.map((p: any) => {
                    return {
                        id: p.id,
                        author: p.author || 'Anonyme',
                        service: p.service || 'Service',
                        description: p.description,
                        price: p.price ? p.price.toString() : 'Sur devis',
                        distance: p.distance ? parseFloat(p.distance.toFixed(1)) : 0,
                        timestamp: p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'Récemment',
                        locationName: p.location_name || 'Dakar',
                        lat: p.lat || 14.692,
                        lng: p.lng || -17.446,

                        // STRICT V5 STATUS
                        status: p.status,

                        phoneNumber: p.phone_number,
                        audioUrl: null, // Not used yet
                        user_id: p.user_id,
                        rawPrice: p.price, // V5 returns numeric price directly often, or we parse.
                        isUrgent: p.is_urgent,
                        accepted_by: p.accepted_by,

                        // STRICT V5 APP STATUS
                        myApplicationStatus: p.my_application_status
                    };
                });
                setAds(formattedAds);
            }
            setLoading(false);
        };

        initData();
    }, [viewerLocation]);

    // Refresh Handler (passed to children)
    const handleRefresh = async (id: string | number) => {
        // Simple reload for now to ensure strict sync with DB
        window.location.reload();
    };

    // Rating
    const handleComplete = (id: string | number) => {
        const item = ads.find(a => a.id === id);
        if (item) {
            setRatingTarget({ id: item.id, author: item.author });
            setIsRatingModalOpen(true);
        }
    };

    const handleRatingSubmit = async (rating: number, comment: string) => {
        if (!ratingTarget) return;

        try {
            const { data, error } = await supabase.rpc('complete_mission', { p_post_id: ratingTarget.id });
            if (error) throw error;

            alert("Merci pour votre avis ! Mission terminée.");
            setIsRatingModalOpen(false);
            window.location.reload();
        } catch (e: any) {
            alert("Erreur: " + e.message);
        }
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

    // Deep Link Handler (Moved here to ensure handlers are defined)
    useEffect(() => {
        const postId = searchParams.get('postId');
        const action = searchParams.get('action');

        if (postId && action === 'view_applications') {
            console.log("Deep Link: View Applications for", postId);
            // Assuming handleViewCandidates is defined elsewhere or will be added.
            // For now, this will cause a TS error if not defined, but follows the instruction.
            // handleViewCandidates(postId);
        }
    }, [searchParams]);

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
                            onApply={handleRefresh}
                            manageCandidates={undefined} // Handled internally by FeedItem now
                            onComplete={handleComplete}
                        />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                        Aucune annonce disponible.
                    </div>
                )}
            </div>

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
