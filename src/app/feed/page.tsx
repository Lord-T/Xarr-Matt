'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import { TopBar } from '@/components/ui/TopBar';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function FeedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [ads, setAds] = useState<FeedItemProps[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // Rating Logic State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: string | number, author: string } | null>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [viewerLocation, setViewerLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Candidate Management State (Deep Link Target)
    const [candidateModalOpen, setCandidateModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // Deep Link Handler
    useEffect(() => {
        const postId = searchParams.get('postId');
        const action = searchParams.get('action');

        if (postId && action === 'view_applications') {
            console.log("Deep Link: View Applications for", postId);
            handleViewCandidates(postId);
        }
    }, [searchParams]);

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

    // HANDLERS
    // Refresh Handler (passed to children)
    const handleRefresh = async (id: string | number) => {
        // Simple reload for now to ensure strict sync with DB
        window.location.reload();
    };

    const handleViewCandidates = async (postId: string | number) => {
        alert("Chargement candidatures...");
        setSelectedPostId(String(postId));
        setCandidateModalOpen(true);
        setLoadingCandidates(true);
        const { data, error } = await supabase.rpc('get_post_applications', { p_post_id: postId });
        if (data) setCandidates(data);
        if (error) alert("Erreur DB: " + error.message);
        setLoadingCandidates(false);
    };

    const handleApproveProvider = async (providerId: string, fee: number) => {
        if (!selectedPostId) return;
        if (confirm(`Valider ce prestataire ?\nCoût: ${fee} FCFA`)) {
            const { data: result, error } = await supabase.rpc('approve_provider', {
                p_post_id: selectedPostId,
                p_provider_id: providerId,
                p_fee: fee
            });
            if (error || !result?.success) alert("Erreur: " + (error?.message || result?.message));
            else {
                alert("✅ Validé !");
                setCandidateModalOpen(false);
                window.location.reload();
            }
        }
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

            alert("Merci ! Mission terminée.");
            setIsRatingModalOpen(false);
            window.location.reload();
        } catch (e: any) {
            alert("Erreur: " + e.message);
        }
    };

    // Filter
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
        <div className="min-h-screen bg-slate-50 pb-20 pt-20">
            <TopBar />

            {/* Sticky Header & Filter */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="px-4 py-3">
                    {/* Search Bar */}
                    <div className="relative flex items-center bg-slate-100 rounded-full px-4 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-md">
                        <Search size={18} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Rechercher (ex: Plomberie)..."
                            className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Pills */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
                    {['all', 'mecanique', 'bricolage', 'cuisine', 'transport'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`
                                flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border
                                ${category === cat
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                            `}
                        >
                            {cat === 'all' ? 'Tout' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed List */}
            <div className="max-w-md mx-auto px-4 pt-4">
                {/* Sort Indicator */}
                <div className="flex items-center gap-1 mb-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        📍 Trié par proximité
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm animate-pulse">Recherche des missions...</p>
                    </div>
                ) : filteredAds.length > 0 ? (
                    <div className="space-y-4">
                        {filteredAds.map(ad => (
                            <FeedItem
                                key={ad.id}
                                item={ad}
                                currentUserId={userId || undefined}
                                onApply={handleRefresh}
                                onManageCandidates={handleViewCandidates}
                                onComplete={handleComplete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-semibold mb-1">Aucune annonce trouvée</h3>
                        <p className="text-slate-500 text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
                    </div>
                )}
            </div>

            {/* Candidate Modal (Premium Styled) */}
            {candidateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Candidatures</h3>
                            <button
                                onClick={() => setCandidateModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 overflow-y-auto space-y-3">
                            {loadingCandidates ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs text-slate-400">Chargement...</p>
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 italic">Aucun candidat pour le moment.</div>
                            ) : (
                                candidates.map(c => (
                                    <div key={c.id} className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer mb-3"
                                            onClick={() => router.push(`/profile/${c.provider_id}`)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                {c.avatar_url ? (
                                                    <img src={c.avatar_url} alt={c.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                                                        {c.full_name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 truncate">{c.full_name}</div>
                                                <div className="text-xs text-slate-500 truncate">{c.profession || 'Prestataire'}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {/* Client-visible Phone Check */}
                                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        📞 {c.phone || c.contact_phone || 'Masqué'}
                                                    </span>
                                                    <span className="text-xs text-yellow-500 font-bold">★ {c.rating ? c.rating.toFixed(1) : 'NEW'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {c.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/profile/${c.provider_id}`)}
                                                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                                                >
                                                    Profil
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const ad = ads.find(a => String(a.id) === selectedPostId);
                                                        let fee = 500;
                                                        if (ad && ad.rawPrice) fee = Math.floor(ad.rawPrice * 0.10);
                                                        if (fee < 100) fee = 100;

                                                        handleApproveProvider(c.provider_id, fee);
                                                    }}
                                                    className="flex-1 py-2 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-sm shadow-green-200"
                                                >
                                                    Valider
                                                </button>
                                            </div>
                                        )}
                                        {c.status === 'accepted' && (
                                            <div className="bg-green-50 text-green-700 text-xs font-bold py-2 rounded-lg text-center border border-green-100">
                                                ✅ Prestataire Validé
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
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

export default function FeedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium animate-pulse">XARR-MATT</p>
                </div>
            </div>
        }>
            <FeedContent />
        </Suspense>
    );
}
