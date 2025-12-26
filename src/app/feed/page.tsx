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
    const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

    // Business Logic: Provider Wallet Balance (Real)
    const [providerBalance, setProviderBalance] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    // Dynamic Settings
    const [commissionConfig, setCommissionConfig] = useState<{ rate: number, fixed_fallback: number }>({ rate: 10, fixed_fallback: 500 });

    // 1. Fetch Data on Mount
    useEffect(() => {
        const initData = async () => {
            setLoading(true);

            // A. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Fetch Balance
                const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
                if (profile) setProviderBalance(profile.balance || 0);
            }

            // B. Fetch Settings
            const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'commission_config').single();
            if (settings?.value) setCommissionConfig(settings.value);

            // C. Fetch Real Ads from Supabase
            // We use 'posts' table. 
            // We also need profile info.
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*, profiles:user_id(full_name)')
                .eq('status', 'available')
                .order('created_at', { ascending: false });

            if (posts) {
                // Map DB posts to UI format
                const formattedAds = posts.map(p => ({
                    id: p.id,
                    author: p.profiles?.full_name || 'Anonyme',
                    service: p.title, // Assuming title is category/service
                    description: p.description,
                    price: p.price ? p.price.toString() : 'Sur devis', // Ensure string
                    distance: 2.5, // Mock distance for now (PostGIS todo)
                    timestamp: new Date(p.created_at).toLocaleDateString(),
                    locationName: p.location || 'Dakar',
                    lat: p.lat || 14.692,
                    lng: p.lng || -17.446,
                    status: p.status,
                    phoneNumber: p.contact_phone,
                    audioUrl: p.audio_url,
                    user_id: p.user_id,
                    rawPrice: p.rawPrice // Use explicit numeric if available
                }));
                // @ts-ignore
                setAds(formattedAds);
            }
            setLoading(false);
        };

        // Realtime Subscription for Settings Updates (Immediate Effect)
        const settingsSub = supabase
            .channel('app_settings_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'key=eq.commission_config' },
                (payload) => {
                    // Live update of commission rate!
                    if (payload.new?.value) {
                        setCommissionConfig(payload.new.value);
                        // Optional toast here: "Taux mis à jour !"
                    }
                })
            .subscribe();

        initData();

        return () => { supabase.removeChannel(settingsSub); };
    }, []);

    const handleAccept = async (id: number) => {
        if (!userId) {
            alert("Veuillez vous connecter.");
            router.push('/login');
            return;
        }

        const ad = ads.find(a => a.id === id);
        if (!ad) return;

        // Calculate Fee
        let fee = commissionConfig.fixed_fallback;

        // Try to parse price
        const cleanPrice = String(ad.price).replace(/[^\d]/g, '');
        if (cleanPrice && cleanPrice.length > 0) {
            const priceValue = parseInt(cleanPrice);
            if (!isNaN(priceValue)) {
                fee = Math.floor(priceValue * (commissionConfig.rate / 100));
            }
        }
        if (fee < 100) fee = 100;

        // 1. Check Balance
        if (providerBalance < (fee + 50)) {
            if (confirm(`🚫 Solde insuffisant !\n\nIl vous faut ${(fee)} FCFA + marge pour accepter.\nVotre solde: ${providerBalance} FCFA\n\nVoulez-vous recharger ?`)) {
                router.push('/wallet'); // Assuming /wallet exists
            }
            return;
        }

        // 2. Deduct Commission AND Update DB
        // 2. ATOMIC TRANSACTION (Secure Server-Side Logic)
        // 2. APPLY TRANSACTION (Candidate Mode)
        if (confirm(`Postuler pour cette mission ?\n\nVotre profil sera envoyé au client pour validation.\nL'argent ne sera débité QUE si le client vous accepte.`)) {

            // UI Feedback
            setAds(currentAds => currentAds.filter(a => a.id !== id));

            // Call the Apply Function
            const { data: result, error: rpcError } = await supabase.rpc('apply_for_mission', {
                p_post_id: id,
                p_user_id: userId
            });

            if (rpcError) {
                alert("Erreur technique : " + rpcError.message);
                window.location.reload();
                return;
            }

            // @ts-ignore
            if (result && result.success === false) {
                // @ts-ignore
                alert("Echec : " + result.message);
                window.location.reload();
                return;
            }

            alert("✅ Candidature envoyée ! Vous recevrez une notif si le client valide.");
        }
    };

    const handleComplete = (id: number) => {
        // Logic for completion
    };

    const handleRatingSubmit = (rating: number, comment: string) => {
        // Logic for rating
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
                            onAccept={handleAccept}
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
