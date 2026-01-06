'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShieldCheck, Award, MapPin, Trash2, Crown, Store, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';

// NOTE: QR Code component removed to prevent 500 Error.

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('portfolio');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }
                setUser(user);

                // 1. Fetch Profile
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error("Profile Error:", error);
                }
                setProfile(profile);

                // 2. Fetch Portfolio & Businesses safely
                await Promise.allSettled([
                    fetchPortfolio(user.id),
                    fetchBusinesses(user.id)
                ]);

            } catch (err) {
                console.error("Critical Profile Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const fetchPortfolio = async (userId: string) => {
        const { data } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (data) setPortfolio(data);
    };

    const fetchBusinesses = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('businesses').select('*').eq('owner_id', userId);
            if (!error && data) setBusinesses(data);
        } catch (e) {
            console.warn("Businesses table optional.");
        }
    };

    const handlePortfolioUpload = async (url: string) => {
        if (!user) return;
        await supabase.from('portfolio_items').insert({
            user_id: user.id,
            image_url: url,
            description: 'Nouvelle réalisation'
        });
        setIsUploadOpen(false);
        fetchPortfolio(user.id);
    };

    const handleDeleteItem = async (id: number) => {
        if (confirm("Supprimer cette photo ?")) {
            await supabase.from('portfolio_items').delete().eq('id', id);
            setPortfolio(prev => prev.filter(item => item.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement du profil...</div>;

    if (!profile) {
        return (
            <div className="p-8 text-center text-red-500 flex flex-col items-center gap-4">
                <p className="font-bold text-lg">Impossible de charger le profil.</p>
                <Button onClick={() => location.reload()}>Réessayer</Button>
            </div>
        );
    }

    // Safe Accessors
    const specialties = profile.specialties || [];
    const isVerified = profile.is_verified || false;
    const subscriptionTier = profile.subscription_tier || 'free';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '90px' }}>

            {/* Header / Cover */}
            <div style={{ position: 'relative', height: '150px', backgroundColor: '#CBD5E1' }}>
                <img
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    alt="Cover"
                />
                <Link href="/feed" style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <ArrowLeft size={24} color="#0F172A" />
                </Link>
            </div>

            {/* Profile Card */}
            <div style={{ padding: '0 1rem', marginTop: '-50px', position: 'relative' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>

                    {/* Avatar */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: '#E2E8F0', border: '4px solid white', margin: '0 auto -40px auto', marginTop: '-50px',
                        backgroundImage: `url("${profile.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}")`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>

                    <div style={{ marginTop: '50px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {profile.full_name || 'Utilisateur'}
                            {isVerified && <ShieldCheck size={20} className="text-green-500" />}
                        </h1>
                        <p style={{ color: '#64748B', fontWeight: 500 }}>
                            {specialties.length > 0 ? specialties.join(' • ') : (profile.role === 'provider' ? 'Prestataire' : 'Membre')}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                            <MapPin size={16} /> {profile.city || 'Sénégal'}
                        </div>

                        {/* Rating Stats */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FEF3C7', padding: '0.25rem 0.75rem', borderRadius: '20px', color: '#D97706', fontWeight: 'bold' }}>
                                <Star size={16} fill="#D97706" style={{ marginRight: '0.25rem' }} /> {profile.rating || '5.0'}
                            </div>
                            <span style={{ color: '#94A3B8' }}>({profile.reviews_count || 0} avis)</span>
                        </div>
                    </div>

                    {/* Verification Badges */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        {subscriptionTier === 'premium' && (
                            <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '12px', backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center' }}>
                                <Crown size={14} style={{ marginRight: '4px' }} /> Premium
                            </div>
                        )}
                        <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center' }}>
                            <Award size={14} style={{ marginRight: '4px' }} /> {profile.years_experience ? `${profile.years_experience} ans exp.` : 'Membre Actif'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '1rem', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginTop: '1rem', backgroundColor: 'white', overflowX: 'auto' }}>
                {['portfolio', 'business', 'avis', 'apropos'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem', border: 'none', background: 'none', whiteSpace: 'nowrap',
                            fontWeight: activeTab === tab ? 700 : 500,
                            color: activeTab === tab ? '#0F172A' : '#94A3B8',
                            borderBottom: activeTab === tab ? '2px solid #0F172A' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {tab === 'portfolio' ? 'Réalisations' : tab === 'business' ? 'Mes Business' : tab === 'avis' ? 'Avis' : 'À Propos'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1rem' }}>

                {/* --- PORTFOLIO TAB --- */}
                {activeTab === 'portfolio' && (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            {!isUploadOpen ? (
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px dashed #CBD5E1', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.5)' }}
                                >
                                    <PlusCircle size={20} /> Ajouter une photo à mon portfolio
                                </button>
                            ) : (
                                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 600 }}>Nouvelle image</h3>
                                        <button onClick={() => setIsUploadOpen(false)}><X size={20} /></button>
                                    </div>
                                    <ImageUpload bucket="portfolio_images" onUpload={handlePortfolioUpload} label="Photo du travail" />
                                </div>
                            )}
                        </div>

                        {portfolio.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>
                                <Store size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                <p>Aucune réalisation pour le moment.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {portfolio.map((item) => (
                                    <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                                        <img src={item.image_url} alt="Work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- BUSINESS TAB --- */}
                {activeTab === 'business' && (
                    <div className="space-y-4">
                        {businesses.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>
                                <Store size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                <p>Aucun espace business configuré.</p>
                                <Link href="/profile/edit" className="text-blue-600 font-bold text-sm mt-2 block">Créer un business</Link>
                            </div>
                        ) : (
                            businesses.map(biz => (
                                <div key={biz.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl">
                                        {biz.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{biz.name}</h3>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">{biz.category}</span>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{biz.description || "Pas de description"}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- REVIEWS TAB --- */}
                {activeTab === 'avis' && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        <p>Les avis s'afficheront ici.</p>
                    </div>
                )}

                {/* --- ABOUT TAB --- */}
                {activeTab === 'apropos' && (
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', lineHeight: 1.6, color: '#475569' }}>
                        {profile.bio || "Pas de description renseignée."}
                    </div>
                )}

            </div>

            {/* Fixed Bottom Action */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem', zIndex: 100 }}>
                <Link href="/profile/edit" style={{ flex: 1 }}>
                    <Button fullWidth variant="outline" style={{ height: '100%' }}>
                        Modifier Profil
                    </Button>
                </Link>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
                    Mega-Profile
                </div>
            </div>
        </div>
    );
}
