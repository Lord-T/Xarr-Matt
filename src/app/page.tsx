'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Filter, Podcast, Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import { TopBar } from '@/components/ui/TopBar';


import { supabase } from '@/lib/supabase';

// Keep INITIAL_ADS as a fallback or remove it if we want purely dynamic
const INITIAL_ADS: FeedItemProps[] = [];

export default function Home() {
  const [ads, setAds] = useState<FeedItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch Current User
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);



  // Haversine Distance Helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Viewer Location State
  const [viewerLocation, setViewerLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Error getting location", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch Real Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedAds: FeedItemProps[] = data.map(post => {
            // Anonymity & Author Logic
            const isMe = currentUserId === post.user_id;
            let displayName = post.author_name;
            if (!displayName && isMe) {
              displayName = (supabase.auth.getUser() as any)?.data?.user?.user_metadata?.full_name || "Moi";
            }
            if (!displayName) displayName = "Membre Xarr-Matt";

            // Coordinate Logic
            let finalLat = post.lat;
            let finalLng = post.lng;
            if (!finalLat && post.location && post.location.includes(',')) {
              const parts = post.location.split(',');
              if (parts.length === 2) {
                finalLat = parseFloat(parts[0]);
                finalLng = parseFloat(parts[1]);
              }
            }
            const mapLat = finalLat || 14.7167; // Default Dakar
            const mapLng = finalLng || -17.4677;

            // Distance Logic
            let distance = 0;
            if (viewerLocation && finalLat && finalLng) {
              distance = calculateDistance(viewerLocation.lat, viewerLocation.lng, finalLat, finalLng);
            } else {
              distance = Math.random() * 5 + 1; // Fallback slightly reduced
            }

            return {
              id: post.id,
              author: displayName,
              service: post.title,
              description: post.description,
              price: post.price ? `${post.price} FCFA` : 'Sur devis',
              distance: parseFloat(distance.toFixed(1)),
              timestamp: new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              locationName: post.location || "Dakar",
              lat: mapLat,
              lng: mapLng,
              status: 'available',
              phoneNumber: post.contact_phone,
              user_id: post.user_id,
              audioUrl: post.audio_url,
              isAnonymous: post.is_anonymous // Anonymity prop
            };
          });
          setAds(formattedAds);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [viewerLocation, currentUserId]); // Depend on viewerLocation

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Rating Logic State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

  // Business Logic: Provider Wallet Balance (Simulated)
  const [providerBalance, setProviderBalance] = useState(2500); // Initial balance
  const COMMISSION_FEE = 500; // 500 FCFA per accepted mission

  const handleEditPost = async (id: number, currentPrice: number, currentDesc: string) => {
    const newPrice = prompt("Modifier le budget (FCFA) :", currentPrice.toString());
    if (newPrice === null) return;

    const priceVal = parseFloat(newPrice);
    if (isNaN(priceVal)) return alert("Prix invalide");

    // Optimistic UI Update
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, price: `${priceVal} FCFA` } : ad));

    const { error } = await supabase.from('posts').update({ price: priceVal }).eq('id', id);
    if (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
    } else {
      // Success
    }
  };

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

  const handleConfirmArrival = (id: number) => {
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

      {/* DEBUG TRACER */}
      <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', textAlign: 'center', padding: '4px', fontWeight: 'bold' }}>
        DEBUG: Déploiement VERIFIÉ à {new Date().toLocaleTimeString()}
      </div>

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
            Chargement des annonces...
          </div>
        ) : filteredAds.length > 0 ? (
          filteredAds.map(ad => (
            <FeedItem
              key={ad.id}
              item={ad}
              currentUserId={currentUserId || undefined}
              onAccept={handleAccept}
              onConfirmArrival={handleConfirmArrival}
              onEdit={handleEditPost}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
            <p>Aucune annonce trouvée.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Soyez le premier à publier !</p>
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

