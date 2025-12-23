'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Crown, CheckCircle, TrendingUp, Zap } from 'lucide-react';

export default function PremiumPage() {
    const router = useRouter();
    const [showPaymentSelection, setShowPaymentSelection] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscribeClick = () => {
        setShowPaymentSelection(true);
    };

    const handlePayment = (method: 'wave' | 'om') => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowPaymentSelection(false);
            alert(`🎉 Paiement ${method === 'wave' ? 'Wave' : 'Orange Money'} accepté !\n\nVous êtes maintenant un membre PRO.`);
            router.push('/profile/view');
        }, 2000);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#1E1B4B', color: 'white', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.8 }}>Xarr-Matt Premium</div>
            </div>

            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <Crown size={64} color="#FBBF24" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Devenez Top Pro</h1>
                <p style={{ color: '#C7D2FE', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto' }}>
                    Multipliez vos clients par 3 avec l'abonnement Premium.
                </p>
            </div>

            <div style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '2rem 1.5rem', color: '#0F172A' }}>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Pourquoi passer Pro ?</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <Feature icon={<TrendingUp size={24} color="#2563EB" />} title="Visibilité Maximale" desc="Appapparaissez en tête de liste et sur la carte avec un badge 👑." />
                    <Feature icon={<Zap size={24} color="#F59E0B" />} title="Alertes Prioritaires" desc="Recevez les nouvelles demandes 5 minutes avant les autres." />
                    <Feature icon={<CheckCircle size={24} color="#10B981" />} title="Badge de Confiance" desc="Rassurez vos clients avec le badge 'Vérifié & Pro'." />
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '2px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '0.25rem' }}>Abonnement Mensuel</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0F172A' }}>2 000 FCFA <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 500 }}>/mois</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.5rem', fontWeight: 600 }}>Rentabilité garantie dès la 1ère mission !</div>
                </div>

                <Button fullWidth size="lg" onClick={handleSubscribeClick} style={{ backgroundColor: '#2563EB', fontSize: '1.1rem' }}>
                    S'abonner maintenant
                </Button>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8', marginTop: '1rem' }}>
                    Annulable à tout moment. Paiement sécurisé via Orange Money / Wave.
                </p>
            </div>

            {/* Payment Selection Modal */}
            {showPaymentSelection && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '2rem', animation: 'slideUp 0.3s ease-out' }}>

                        {isProcessing ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ fontWeight: 600, color: '#0F172A' }}>Validation en cours...</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Veuillez valider sur votre téléphone.</p>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0F172A', textAlign: 'center' }}>Choisissez votre moyen de paiement</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        onClick={() => handlePayment('wave')}
                                        style={{ padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#1DC4FF', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Wave_logo_Logotype.png/640px-Wave_logo_Logotype.png" alt="" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
                                        Payer avec Wave
                                    </button>

                                    <button
                                        onClick={() => handlePayment('om')}
                                        style={{ padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#FF7900', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <span>Orange Money</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowPaymentSelection(false)}
                                    style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', border: 'none', background: 'transparent', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Annuler
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
      `}</style>

        </div>
    );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{desc}</p>
            </div>
        </div>
    );
}
