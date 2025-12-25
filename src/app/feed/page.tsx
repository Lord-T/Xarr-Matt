'use client';

import React, { useState, useMemo } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Filter, Podcast, Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import { TopBar } from '@/components/ui/TopBar';

// Enhanced Mock Data with GPS Coordinates and Phone Numbers
const INITIAL_ADS: FeedItemProps[] = [
    {
        id: 1, author: "Awa Ndiaye", service: "Cuisine",
        description: "Je cherche quelqu'un pour préparer un Thiéboudienne pour 10 personnes ce samedi.",
        price: "15 000 FCFA", distance: 0.5, timestamp: "Il y a 10 min", locationName: "Médina, Dakar",
        lat: 14.681, lng: -17.448, status: 'available', phoneNumber: "+221770000001",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo Audio
        user_id: "mock_1"
    },
    {
        id: 2, author: "Modou Fall", service: "Mécanique",
        description: "Mécanicien disponible pour dépannage rapide sur l'autoroute à péage.",
        price: "Sur devis", distance: 12.0, timestamp: "Il y a 2 min", locationName: "Rufisque",
        lat: 14.712, lng: -17.271, status: 'available', phoneNumber: "+221770000002",
        user_id: "mock_2"
    },
    {
        id: 3, author: "Jean Mendy", service: "Bricolage",
        description: "Besoin d'aide pour monter une armoire et fixer des étagères.",
        price: "10 000 FCFA", distance: 1.2, timestamp: "Il y a 1h", locationName: "Plateau, Dakar",
        lat: 14.667, lng: -17.433, status: 'available', phoneNumber: "+221770000003",
        user_id: "mock_3"
    },
    {
        id: 4, author: "Fatou Diop", service: "Transport",
        description: "Cherche course express Colobane -> Almadies pour un colis léger.",
        price: "3 000 FCFA", distance: 3.5, timestamp: "Il y a 15 min", locationName: "Colobane",
        lat: 14.694, lng: -17.456, status: 'available', phoneNumber: "+221770000004",
        user_id: "mock_4"
    },
    {
        id: 5, author: "Ibrahima Ba", service: "Plomberie",
        description: "Fuite d'eau urgente dans la cuisine. Besoin d'un plombier qualifié.",
        price: "A discuter", distance: 0.8, timestamp: "Il y a 30 min", locationName: "Fann Hock",
        lat: 14.688, lng: -17.464, status: 'available', phoneNumber: "+221770000005",
        user_id: "mock_5"
    },
];

export default function FeedPage() {
    const [ads, setAds] = useState<FeedItemProps[]>(INITIAL_ADS);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');

    // Rating Logic State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

    // Business Logic: Provider Wallet Balance (Simulated)
    const [providerBalance, setProviderBalance] = useState(2500); // Initial balance
    const COMMISSION_FEE = 500; // 500 FCFA per accepted mission

    const handleAccept = (id: number) => {
        // 1. Check Balance
        if (providerBalance < 700) {
            if (confirm("🚫 Solde insuffisant !\n\nIl vous faut au moins 700 FCFA pour accepter une mission (Commission: 500 FCFA).\n\nVoulez-vous recharger votre compte maintenant ?")) {
                window.location.href = '/wallet';
            }
            return; // Block execution
        }

        // 2. Deduct Commission
        if (confirm(`Accepter cette mission ?\n\nUne commission de ${COMMISSION_FEE} FCFA sera prélevée sur votre portefeuille.`)) {
            setProviderBalance(prev => prev - COMMISSION_FEE);

            // 3. Update Status
            setAds(currentAds => currentAds.map(ad =>
                ad.id === id ? { ...ad, status: 'accepted' } : ad
            ));
        }
    };

    const handleComplete = (id: number) => {
        // Simulate Client Confirmation -> Deletes Ad
        const ad = ads.find(a => a.id === id);
        if (ad) {
            setRatingTarget({ id: ad.id, author: ad.author });
            setIsRatingModalOpen(true);
        }
    };

    const handleRatingSubmit = (rating: number, comment: string) => {
        if (ratingTarget) {
            // Here we would send the rating to backend
            console.log(`Submitted rating for ${ratingTarget.id}: ${rating} stars, comment: ${comment}`);

            // Then delete the ad and close modal
            setAds(currentAds => currentAds.filter(ad => ad.id !== ratingTarget.id));
            setIsRatingModalOpen(false);
            setRatingTarget(null);
            alert(`Merci ! Votre avis de ${rating} étoiles a été enregistré.`);
        }
    };

    // Sorting and Filtering Logic
    const filteredAds = useMemo(() => {
        let filtered = [...ads];

        // 1. Filter by Category & Search
        if (category !== 'all') {
            filtered = filtered.filter(ad => ad.service.toLowerCase() === category);
        }
        if (searchTerm) {
            filtered = filtered.filter(ad =>
                ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ad.service.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort by Proximity (Distance Ascending)
        filtered.sort((a, b) => a.distance - b.distance);

        return filtered;
    }, [ads, searchTerm, category]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', position: 'relative', paddingTop: '80px' }}>

            <TopBar />

            {/* Header & Filter */}
            <div style={{ padding: '0 1rem 1rem 1rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        backgroundColor: 'var(--input)', borderRadius: 'var(--radius)', padding: '0 0.5rem'
                    }}>
                        <Search size={18} color="var(--muted)" />
                        <input
                            type="text"
                            placeholder="Rechercher (ex: Plomberie)..."
                            className="input"
                            style={{ border: 'none', background: 'transparent' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white', cursor: 'pointer' }}>
                        <Filter size={20} color="var(--primary)" />
                    </button>
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
                                fontSize: '0.8rem',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
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
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    📍 Trié par proximité (le plus proche en premier)
                </div>

                {filteredAds.length > 0 ? (
                    filteredAds.map(ad => (
                        <FeedItem
                            key={ad.id}
                            item={ad}
                            currentUserId={undefined}
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
