'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

export default function SplashAd() {
    const [visible, setVisible] = useState(false);
    const [adData, setAdData] = useState<{ image: string, link: string, active: boolean, title: string } | null>(null);

    useEffect(() => {
        // 1. Check if already shown in this session
        const hasShown = sessionStorage.getItem('splash_ad_shown');
        if (hasShown) return;

        // 2. Fetch Ad Config (Simulated for now, would be Supabase 'app_settings')
        const simulatedAd = {
            active: true,
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000", // Generic cool background
            link: "https://example.com/promo",
            title: "Bienvenue sur Xarr-Matt"
        };

        if (simulatedAd.active) {
            setAdData(simulatedAd);
            setVisible(true);
            sessionStorage.setItem('splash_ad_shown', 'true');
        }

    }, []);

    if (!visible || !adData) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* Close Button */}
            <button
                onClick={() => setVisible(false)}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={24} color="black" />
            </button>

            {/* Ad Content */}
            <div
                className="ad-container"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
            >
                <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
                    <img
                        src={adData.image}
                        alt="Publicité"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        padding: '2rem 1rem 1rem 1rem',
                        color: 'white'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{adData.title}</h2>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Découvrez nos partenaires exclusifs.</p>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => {
                            window.open(adData.link, '_blank');
                            setVisible(false);
                        }}
                    >
                        Voir l'offre <ExternalLink size={18} style={{ marginLeft: '0.5rem' }} />
                    </Button>
                    <button
                        onClick={() => setVisible(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Continuer vers l'application
                    </button>
                </div>
            </div>
        </div>
    );
}
