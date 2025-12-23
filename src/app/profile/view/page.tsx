'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, ShieldCheck, Award, MapPin, Phone, MessageCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProfileViewPage() {
    const [activeTab, setActiveTab] = useState('portfolio');

    // Mock Data
    const provider = {
        name: "Modou Fall",
        job: "Mécanicien Expert",
        location: "Rufisque, Dakar",
        rating: 4.8,
        reviewsCount: 124,
        verified: true,
        bio: "Spécialiste des pannes moteurs et électronique auto. Disponible 7j/7 pour intervention rapide sur Dakar et banlieue.",
        badges: ["Identité Vérifiée", "Top Prestataire", "Réponse Rapide"],
        portfolio: [
            "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1498889444388-e67ea62c464b?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80"
        ],
        reviews: [
            { id: 1, user: "Jean M.", rating: 5, text: "Très pro, il a réparé ma voiture en 30mn sur l'autoroute. Merci Modou !", date: "Il y a 2 jours" },
            { id: 2, user: "Fatou D.", rating: 4, text: "Bon travail, mais arrivé un peu en retard. Sinon rien à dire.", date: "Il y a 1 semaine" },
        ]
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>

            {/* Header Image & Nav */}
            <div style={{ position: 'relative', height: '150px', backgroundColor: '#CBD5E1' }}>
                <img
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Cover"
                />
                <Link href="/feed" style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <ArrowLeft size={24} color="#0F172A" />
                </Link>
            </div>

            {/* Profile Info Card */}
            <div style={{ padding: '0 1rem', marginTop: '-50px', position: 'relative' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>

                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E2E8F0', border: '4px solid white', margin: '0 auto -40px auto', marginTop: '-50px', backgroundImage: 'url("https://randomuser.me/api/portraits/men/32.jpg")', backgroundSize: 'cover' }}></div>

                    <div style={{ marginTop: '50px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A' }}>{provider.name}</h1>
                        <p style={{ color: '#64748B', fontWeight: 500 }}>{provider.job}</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                            <MapPin size={16} /> {provider.location}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FEF3C7', padding: '0.25rem 0.75rem', borderRadius: '20px', color: '#D97706', fontWeight: 'bold' }}>
                                <Star size={16} fill="#D97706" style={{ marginRight: '0.25rem' }} /> {provider.rating}
                            </div>
                            <span style={{ color: '#94A3B8' }}>({provider.reviewsCount} avis)</span>
                        </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        {provider.badges.map(badge => (
                            <div key={badge} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center' }}>
                                {badge === "Identité Vérifiée" ? <ShieldCheck size={14} style={{ marginRight: '4px' }} /> : <Award size={14} style={{ marginRight: '4px' }} />}
                                {badge}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '1rem', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginTop: '1rem', backgroundColor: 'white' }}>
                {['portfolio', 'avis', 'apropos'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: '0.5rem', border: 'none', background: 'none',
                            fontWeight: activeTab === tab ? 700 : 500,
                            color: activeTab === tab ? '#0F172A' : '#94A3B8',
                            borderBottom: activeTab === tab ? '2px solid #0F172A' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {tab === 'portfolio' ? 'Réalisations' : tab === 'avis' ? 'Avis' : 'À Propos'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1rem' }}>

                {/* Portfolio Grid */}
                {activeTab === 'portfolio' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {provider.portfolio.map((img, idx) => (
                            <div key={idx} style={{ aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                                <img src={img} alt="Work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Reviews List */}
                {activeTab === 'avis' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {provider.reviews.map(review => (
                            <div key={review.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{review.user}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{review.date}</span>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "#FBBF24" : "none"} color="#FBBF24" />
                                    ))}
                                </div>
                                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>{review.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* About */}
                {activeTab === 'apropos' && (
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', lineHeight: 1.6, color: '#475569' }}>
                        {provider.bio}
                    </div>
                )}

            </div>

            {/* Fixed Bottom Action */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
                {/* Fixed Bottom Action (Self View Mode) */}
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem', zIndex: 100 }}>
                    <Link href="/profile/edit" style={{ flex: 1 }}>
                        <Button fullWidth variant="outline" style={{ height: '100%' }}>
                            Modifier Profil
                        </Button>
                    </Link>
                    <Link href="/premium" style={{ flex: 1 }}>
                        <Button fullWidth style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', height: '100%' }}>
                            <Crown size={20} style={{ marginRight: '0.5rem' }} /> Passer Pro
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    );
}
