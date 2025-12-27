'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Link from 'next/link';

export default function VerificationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'initial' | 'pending' | 'approved' | 'rejected'>('initial');
    const [cniFront, setCniFront] = useState('');
    const [cniBack, setCniBack] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUser(user);

        // Check recent requests
        const { data: req } = await supabase
            .from('verification_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (req) {
            // Map DB status to UI status
            if (req.status === 'pending') setStatus('pending');
            else if (req.status === 'approved') setStatus('approved');
            else if (req.status === 'rejected') setStatus('rejected');
            else setStatus('initial');
        }

        // Also check profile directly (Truth source)
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', user.id)
            .single();

        if (profile?.is_verified) setStatus('approved');

        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!cniFront) return alert("Veuillez ajouter le recto de votre pièce d'identité.");
        setSubmitting(true);

        const { error } = await supabase
            .from('verification_requests')
            .insert({
                user_id: user.id,
                document_url: cniFront + ',' + (cniBack || ''),
                status: 'pending'
            });

        if (error) {
            alert("Erreur: " + error.message);
        } else {
            setStatus('pending');
            alert("Demande envoyée ! L'administrateur va vérifier votre dossier.");
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '20px' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Vérification d'Identité</h1>
            </div>

            <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>

                {status === 'approved' && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <ShieldCheck size={48} color="#059669" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>Compte Vérifié !</h2>
                        <p style={{ color: '#64748B' }}>Votre identité a été confirmée. Vous possédez le badge de confiance.</p>
                        <Link href="/feed">
                            <Button fullWidth style={{ marginTop: '2rem', backgroundColor: '#059669', color: 'white' }}>Retour à l'accueil</Button>
                        </Link>
                    </div>
                )}

                {status === 'pending' && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#FFF7ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Clock size={48} color="#EA580C" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EA580C', marginBottom: '0.5rem' }}>Dossier en cours...</h2>
                        <p style={{ color: '#64748B' }}>Nous analysons votre document. Vous recevrez une notification sous 24h.</p>
                        <Button variant="outline" fullWidth style={{ marginTop: '2rem' }} onClick={() => router.back()}>Retour</Button>
                    </div>
                )}

                {(status === 'initial' || status === 'rejected') && (
                    <>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Pourquoi vérifier son compte ?</h2>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                                    <CheckCircle size={20} color="#10B981" />
                                    Badge "Vérifié" visible par les clients
                                </li>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                                    <CheckCircle size={20} color="#10B981" />
                                    +50% de chances d'être choisi
                                </li>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                                    <CheckCircle size={20} color="#10B981" />
                                    Accès aux missions Premium
                                </li>
                            </ul>
                        </div>

                        {status === 'rejected' && (
                            <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '8px', color: '#B91C1C', marginBottom: '1.5rem', border: '1px solid #FECACA', display: 'flex', gap: '10px' }}>
                                <AlertCircle size={20} />
                                <div>
                                    <strong>Dossier Refusé :</strong> Votre document n'était pas lisible ou conforme. Veuillez réessayer.
                                </div>
                            </div>
                        )}

                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Télécharger une pièce d'identité</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
                                Carte Nationale d'Identité (CNI) ou Passeport en cours de validité. Format visible.
                            </p>

                            <div className="space-y-6">
                                <ImageUpload
                                    bucket="verification_docs"
                                    label="Photo de la pièce (Recto)"
                                    currentImage={cniFront}
                                    onUpload={setCniFront}
                                />
                                <ImageUpload
                                    bucket="verification_docs"
                                    label="Photo de la pièce (Verso - Optionnel)"
                                    currentImage={cniBack}
                                    onUpload={setCniBack}
                                />
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <Button
                                    fullWidth
                                    onClick={handleSubmit}
                                    disabled={submitting || !cniFront}
                                    style={{ backgroundColor: '#2563EB', color: 'white', opacity: (submitting || !cniFront) ? 0.7 : 1 }}
                                >
                                    {submitting ? 'Envoi en cours...' : 'Envoyer pour examen'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
