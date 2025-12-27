'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function VerificationPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
    const [cniFront, setCniFront] = useState('');
    const [cniBack, setCniBack] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check Profile
        const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', user.id).single();
        if (profile?.is_verified) {
            setStatus('verified');
            setLoading(false);
            return;
        }

        // Check Requests
        const { data: req } = await supabase
            .from('verification_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (req) {
            if (req.status === 'pending') setStatus('pending');
            else if (req.status === 'rejected') setStatus('rejected');
            else setStatus('none');
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!cniFront) return alert("Veuillez ajouter le recto de la pièce d'identité.");

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Save Request
            const { error } = await supabase.from('verification_requests').insert({
                user_id: user.id,
                document_url: cniFront + ',' + (cniBack || ''), // Store both urls joined or use JSON if schema allows. Simple comma separated for now.
                status: 'pending'
            });

            if (error) throw error;

            setStatus('pending');
            alert("Votre demande a été envoyée !");
        } catch (error: any) {
            alert("Erreur: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Vérification d'Identité</h1>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>

                {/* Status Verified */}
                {status === 'verified' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-green-800 mb-2">Profil Vérifié !</h2>
                        <p className="text-green-700">Merci. Votre identité a été confirmée. Vous avez maintenant le badge de confiance.</p>
                    </div>
                )}

                {/* Status Pending */}
                {status === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <Clock size={48} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-blue-800 mb-2">En cours d'examen</h2>
                        <p className="text-blue-700">Nos équipes analysent vos documents. Cela prend généralement moins de 24h.</p>
                    </div>
                )}

                {/* Status Form (None or Rejected) */}
                {(status === 'none' || status === 'rejected') && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                        {status === 'rejected' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-3">
                                <AlertCircle shrink-0 />
                                <div>
                                    <div className="font-bold">Demande précédente refusée</div>
                                    <div className="text-sm">Veuillez soumettre des photos plus claires.</div>
                                </div>
                            </div>
                        )}

                        <h3 className="font-bold text-lg mb-4">Envoyer vos documents</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Pour garantir la sécurité de la communauté, nous demandons une pièce d'identité officielle (CNI, Passeport).
                            Vos données sont cryptées et stockées de manière sécurisée.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Recto (Face Photo)</label>
                                <ImageUpload
                                    bucket="verification_docs"
                                    label="Photo Recto"
                                    currentImage={cniFront}
                                    onUpload={setCniFront}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Verso (Dos)</label>
                                <ImageUpload
                                    bucket="verification_docs"
                                    label="Photo Verso"
                                    currentImage={cniBack}
                                    onUpload={setCniBack}
                                />
                            </div>

                            <Button onClick={handleSubmit} fullWidth disabled={!cniFront}>
                                Envoyer pour vérification
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
