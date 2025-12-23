'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle, Smartphone } from 'lucide-react';

interface PaymentModalProps {
    amount?: number;
    isOpen: boolean;
    onClose: () => void;
    onPaymentComplete: () => void;
}

export function PaymentModal({ amount = 5000, isOpen, onClose, onPaymentComplete }: PaymentModalProps) {
    const [method, setMethod] = useState<'wave' | 'om' | 'free' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    if (!isOpen) return null;

    const handlePay = () => {
        if (!method) return;
        setProcessing(true);

        // Simulate API delay
        setTimeout(() => {
            setProcessing(false);
            setCompleted(true);
            setTimeout(() => {
                onPaymentComplete();
                onClose(); // Auto close after success
            }, 2000);
        }, 2000);
    };

    if (completed) {
        return (
            <div style={overlayStyle}>
                <div style={modalStyle}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Paiement Réussi !</h2>
                        <p style={{ color: 'var(--muted)' }}>Votre transaction de {amount} FCFA est confirmée.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Paiement Sécurisé</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Montant à payer</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{amount.toLocaleString()} FCFA</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <SelectionCard
                        selected={method === 'wave'}
                        onClick={() => setMethod('wave')}
                        color="#1DC4FF"
                        label="Wave"
                    />
                    <SelectionCard
                        selected={method === 'om'}
                        onClick={() => setMethod('om')}
                        color="#FF7900"
                        label="Orange"
                    />
                    <SelectionCard
                        selected={method === 'free'}
                        onClick={() => setMethod('free')}
                        color="#EF4135"
                        label="Free"
                    />
                </div>

                {method && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Numéro de paiement</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
                            <Smartphone size={18} color="var(--muted)" style={{ marginRight: '0.5rem' }} />
                            <input type="tel" placeholder="77 000 00 00" className="input" style={{ border: 'none', padding: 0 }} autoFocus />
                        </div>
                    </div>
                )}

                <Button fullWidth size="lg" disabled={!method || processing} onClick={handlePay}>
                    {processing ? 'Traitement en cours...' : `Payer ${amount.toLocaleString()} FCFA`}
                </Button>
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)',
    width: '100%', maxWidth: '400px', padding: '1.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

function SelectionCard({ selected, onClick, color, label }: { selected: boolean, onClick: () => void, color: string, label: string }) {
    return (
        <div
            onClick={onClick}
            style={{
                border: `2px solid ${selected ? color : 'var(--border)'}`,
                backgroundColor: selected ? `${color}10` : 'transparent',
                borderRadius: 'var(--radius)',
                padding: '1rem 0.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color, margin: '0 auto 0.5rem auto' }}></div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
        </div>
    );
}
