'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, ShieldCheck } from 'lucide-react';

export default function VerificationPage() {
    const [step, setStep] = useState(1);
    const [recto, setRecto] = useState<File | null>(null);
    const [verso, setVerso] = useState<File | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'recto' | 'verso') => {
        if (e.target.files && e.target.files[0]) {
            if (side === 'recto') setRecto(e.target.files[0]);
            else setVerso(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2); // Move to success state
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/profile">
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Vérification d'Identité</h1>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {step === 1 && (
                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Confiance Xarr-Matt</h2>
                            <p style={{ color: 'var(--muted)' }}>
                                Pour garantir la sécurité de tous, nous vérifions l'identité de chaque prestataire.
                            </p>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>1. Recto de la CNI</h3>
                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    backgroundColor: recto ? '#F0FDF4' : 'transparent',
                                    borderColor: recto ? 'var(--success)' : 'var(--border)'
                                }}
                            >
                                <input
                                    type="file"
                                    id="recto"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleUpload(e, 'recto')}
                                />
                                <label htmlFor="recto" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    {recto ? (
                                        <>
                                            <CheckCircle color="var(--success)" size={32} />
                                            <span style={{ fontWeight: 500 }}>Fichier ajouté</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{recto.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload color="var(--primary)" size={32} />
                                            <span style={{ fontWeight: 500 }}>Scanner ou importer</span>
                                        </>
                                    )}

                                </label>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>2. Verso de la CNI</h3>
                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    backgroundColor: verso ? '#F0FDF4' : 'transparent',
                                    borderColor: verso ? 'var(--success)' : 'var(--border)'
                                }}
                            >
                                <input
                                    type="file"
                                    id="verso"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleUpload(e, 'verso')}
                                />
                                <label htmlFor="verso" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    {verso ? (
                                        <>
                                            <CheckCircle color="var(--success)" size={32} />
                                            <span style={{ fontWeight: 500 }}>Fichier ajouté</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{verso.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload color="var(--primary)" size={32} />
                                            <span style={{ fontWeight: 500 }}>Scanner ou importer</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <Button fullWidth size="lg" disabled={!recto || !verso}>
                            Envoyer pour validation
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center', maxWidth: '400px', marginTop: '3rem' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            backgroundColor: '#DCFCE7', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <CheckCircle size={48} color="var(--success)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Documents Reçus !</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Notre équipe va vérifier vos documents sous 24h.
                            Vous recevrez une notification SMS une fois votre profil certifié.
                        </p>
                        <Link href="/profile">
                            <Button variant="outline">Retour au profil</Button>
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
