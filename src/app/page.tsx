'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { FeedItem, FeedItemProps } from '@/components/FeedItem';
import { Filter, Podcast, Search } from 'lucide-react';
import { RatingModal } from '@/components/ui/RatingModal';
import SplashAd from '@/components/SplashAd';
import { TopBar } from '@/components/ui/TopBar';


import { supabase } from '@/lib/supabase';

// Keep INITIAL_ADS as a fallback
const INITIAL_ADS: FeedItemProps[] = [];

export default function Home() {
  const [ads, setAds] = useState<FeedItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [providerBalance, setProviderBalance] = useState(0);
  const [viewerLocation, setViewerLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Fetch Current User & Balance
  useEffect(() => {
    // Initial check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Fetch real balance
        const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        if (data) setProviderBalance(data.balance || 0);
      }
    };
    checkUser();

    // Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
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
              distance = 0; // No fake random distance
            }

            return {
              id: post.id,
              author: displayName,
              service: post.title,
              description: post.description,
              price: post.price ? `${post.price} FCFA` : 'Sur devis',
              rawPrice: post.price || 0, // Store number for calculation
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

  // 🔔 Notification Poller ( Requirement 3: Triple Notification )
  useEffect(() => {
    if (!currentUserId) return;

    const checkMyAdsStatus = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('status', 'taken'); // Accepted by provider

      if (data && data.length > 0) {
        // Check if we already notified for these (simple local storage check to avoid spam)
        const notifiedIds = JSON.parse(localStorage.getItem('notified_jobs') || '[]');
        const newTaken = data.filter(ad => !notifiedIds.includes(ad.id));

        if (newTaken.length > 0) {
          // 1. Center Screen Notification (Alert)
          alert(`🔔 EXCELLENTE NOUVELLE !\n\nVotre annonce "${newTaken[0].title}" a été acceptée par un prestataire !\n\nAllez dans "Mes Activités" pour suivre l'avancée.`);

          // Mark as notified
          const newIds = [...notifiedIds, ...newTaken.map(ad => ad.id)];
          localStorage.setItem('notified_jobs', JSON.stringify(newIds));

          // 2. Redirect optionally
          // window.location.href = '/activities';
        }
      }
    };

    const interval = setInterval(checkMyAdsStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [currentUserId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Rating Logic State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{ id: number, author: string } | null>(null);

  // Business Logic: Provider Wallet Balance (Simulated removed, now real)
  const COMMISSION_FEE = 0; // Dynamic now


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

  const handleCancel = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
      await supabase.from('posts').delete().eq('id', id);
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  const handleAccept = async (id: number) => {
    const adToAccept = ads.find(ad => ad.id === id);
    if (!adToAccept) return;

    // Use dynamic commission rate from settings (default 10% if not loaded yet)
    // Ideally we should fetch this or pass it down. For now, assuming standard rate.
    const rate = 10;
    const fee = Math.ceil((adToAccept.rawPrice || 0) * (rate / 100));

    // 2. ATOMIC TRANSACTION (Secure Server-Side Logic)
    // 2. APPLY TRANSACTION (Candidate Mode)
    if (confirm(`Postuler pour cette mission ?\n\nVotre profil sera envoyé au client pour validation.\nL'argent ne sera débité QUE si le client vous accepte.`)) {

      // UI Feedback
      setAds(currentAds => currentAds.filter(a => a.id !== id));

      // Call the Apply Function
      const { data: result, error: rpcError } = await supabase.rpc('apply_for_mission', {
        p_user_id: currentUserId,
        p_post_id: id
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

      alert("✅ Candidature envoyée ! Attendez la validation du client.");
    }
  };

  const handleComplete = (id: number) => {
    // Author decides to complete the job
    const ad = ads.find(a => a.id === id);
    if (ad) {
      setRatingTarget({ id, author: "Prestataire" }); // Verify who we rate (normally the Provider)
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

    // 2. Sort by Relevance (Domain) then Proximity (Distance)
    // NOTE: In a real app, 'userDomain' would come from the user's profile.
    const userDomain = "Mécanique"; // Example: The user is a Mechanic

    filtered.sort((a, b) => {
      const aIsMyDomain = a.service.toLowerCase().includes(userDomain.toLowerCase());
      const bIsMyDomain = b.service.toLowerCase().includes(userDomain.toLowerCase());

      // Priority 1: Domain match
      if (aIsMyDomain && !bIsMyDomain) return -1;
      if (!aIsMyDomain && bIsMyDomain) return 1;

      // Priority 2: Proximity (Distance)
      return a.distance - b.distance;
    });

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
              onComplete={handleComplete}
              onCancel={handleCancel}
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

