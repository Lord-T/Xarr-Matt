'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MapPin, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    const slides = [
        {
            icon: <MapPin size={64} color="#F97316" />,
            title: "Trouvez un PRO autour de vous",
            desc: "Plombiers, mécaniciens, couturiers... Localisez les meilleurs prestataires à moins de 2km."
        },
        {
            icon: <ShieldCheck size={64} color="#2563EB" />,
            title: "Des profils vérifiés & notés",
            desc: "Consultez les photos des réalisations et les avis clients. La sécurité avant tout."
        },
        {
            icon: <CreditCard size={64} color="#10B981" />,
            title: "Paiement simple & Commission",
            desc: "Payez via Wave ou Orange Money. Le prestataire verse automatiquement sa commission."
        }
    ];

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            router.push('/');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: 'white', textAlign: 'center' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ marginBottom: '2rem', padding: '2rem', backgroundColor: '#F8FAFC', borderRadius: '50%' }}>
                    {slides[step].icon}
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0F172A' }}>
                    {slides[step].title}
                </h1>
                <p style={{ color: '#64748B', lineHeight: 1.6, maxWidth: '300px' }}>
                    {slides[step].desc}
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {slides.map((_, i) => (
                    <div key={i} style={{ width: i === step ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === step ? 'var(--primary)' : '#E2E8F0', transition: 'all 0.3s' }}></div>
                ))}
            </div>

            <div>
                <Button fullWidth size="lg" onClick={handleNext}>
                    {step === slides.length - 1 ? "Commencer" : "Suivant"} <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
                </Button>
                <button onClick={() => router.push('/')} style={{ marginTop: '1rem', border: 'none', background: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer' }}>
                    Passer
                </button>
            </div>

        </div>
    );
}
