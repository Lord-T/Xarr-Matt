'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Wrench, Droplets, Car, Key, MapPin } from 'lucide-react';

export default function SOSPage() {
    const router = useRouter();
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherMessage, setOtherMessage] = useState('');

    const handleSOS = (type: string) => {
        if (type === 'autre' && !showOtherInput) {
            setShowOtherInput(true);
            return;
        }

        setStatus('searching');
        // Simulate network search
        setTimeout(() => {
            setStatus('found');
        }, 3000);
    };

    if (status === 'searching') {
        return (
            <div style={{ height: '100vh', backgroundColor: '#EF4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid white', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    <AlertCircle size={64} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '2rem' }}>Alerte envoyée !</h2>
                <p style={{ marginTop: '1rem', opacity: 0.9 }}>
                    {otherMessage ? `Recherche pour : "${otherMessage}"` : "Recherche des prestataires disponibles autour de vous..."}
                </p>
                <style jsx>{`
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
            </div>
        );
    }

    if (status === 'found') {
        return (
            <div style={{ height: '100vh', backgroundColor: '#22C55E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E', marginBottom: '2rem' }}>
                    <Wrench size={48} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Secours Trouvé !</h1>
                <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Modou arrive dans 5 min.</p>
                <div style={{ marginTop: '3rem', width: '100%' }}>
                    <button
                        onClick={() => router.push('/tracking')}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: 'white', color: '#22C55E', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        Suivre son arrivée
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FEF2F2', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#EF4444' }}>
                <AlertCircle size={32} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>URGENCE / SOS</h1>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                    <MapPin size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Position détectée</div>
                    <div style={{ fontWeight: 600 }}>Autoroute A1, Sortie 8</div>
                </div>
            </div>

            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
                {showOtherInput ? "Précisez votre urgence :" : "Quel est votre problème ?"}
            </p>

            {showOtherInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <textarea
                        autoFocus
                        value={otherMessage}
                        onChange={(e) => setOtherMessage(e.target.value)}
                        placeholder="Ex: Pneu crevé, Besoin d'essence..."
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #FECACA',
                            fontSize: '1rem', height: '150px', resize: 'none'
                        }}
                    />
                    <button
                        onClick={() => handleSOS('custom')}
                        disabled={!otherMessage.trim()}
                        style={{
                            padding: '1rem', backgroundColor: '#EF4444', color: 'white', border: 'none',
                            borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
                            opacity: otherMessage.trim() ? 1 : 0.5
                        }}
                    >
                        LANCER L'ALERTE 🚨
                    </button>
                    <button
                        onClick={() => setShowOtherInput(false)}
                        style={{ padding: '1rem', border: 'none', background: 'none', color: '#64748B' }}
                    >
                        Retour
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

                    <button onClick={() => handleSOS('panne')} style={btnStyle}>
                        <Car size={32} />
                        <span>Panne Auto</span>
                    </button>

                    <button onClick={() => handleSOS('fuite')} style={btnStyle}>
                        <Droplets size={32} />
                        <span>Fuite Eau</span>
                    </button>

                    <button onClick={() => handleSOS('serrure')} style={btnStyle}>
                        <Key size={32} />
                        <span>Serrurier</span>
                    </button>

                    <button onClick={() => handleSOS('autre')} style={btnStyle}>
                        <Wrench size={32} />
                        <span>Autre</span>
                    </button>

                </div>
            )}

            {!showOtherInput && (
                <button onClick={() => router.back()} style={{ marginTop: 'auto', padding: '1rem', border: 'none', background: 'none', color: '#64748B', fontWeight: 500, cursor: 'pointer' }}>
                    Annuler
                </button>
            )}

        </div>
    );
}

const btnStyle = {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '1.5rem', backgroundColor: 'white', border: '2px solid #FECACA', borderRadius: '16px',
    color: '#EF4444', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)', transition: 'transform 0.1s'
};
