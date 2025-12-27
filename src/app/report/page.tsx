'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ReportPage() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Get Form Data
        const form = e.target as HTMLFormElement;
        const reason = (form.elements.namedItem('reason') as HTMLSelectElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        // Get User
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());

        if (!user) {
            alert("Veuillez vous connecter.");
            router.push('/login');
            return;
        }

        // Insert Report
        const { error } = await import('@/lib/supabase').then(m => m.supabase.from('reports').insert({
            reporter_id: user.id,
            reason,
            description,
            status: 'pending'
        }));

        setLoading(false);

        if (error) {
            alert("Erreur: " + error.message);
        } else {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                <ShieldAlert size={64} color="#10B981" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Signalement Reçu</h1>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Merci de contribuer à la sécurité de Xarr-Matt. Notre équipe va analyser ce profil sous 24h.</p>
                <Button onClick={() => router.back()} fullWidth>Retour</Button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '1.5rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Signaler un problème</h1>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', display: 'flex', gap: '1rem', marginBottom: '2rem', color: '#B91C1C', fontSize: '0.9rem' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                    Ce signalement est anonyme et sera traité par l'équipe de modération.
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Motif du signalement</label>
                    <select name="reason" className="input" style={{ width: '100%', backgroundColor: 'white' }} required>
                        <option value="">Sélectionnez un motif...</option>
                        <option value="fake">Faux profil / Usurpation</option>
                        <option value="scam">Tentative d'arnaque</option>
                        <option value="rude">Comportement inapproprié / Insultes</option>
                        <option value="spam">Spam / Pub abusive</option>
                        <option value="other">Autre</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description (Optionnel)</label>
                    <textarea
                        name="description"
                        className="input"
                        rows={5}
                        placeholder="Donnez nous plus de détails..."
                        style={{ width: '100%', resize: 'none' }}
                    />
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <Button fullWidth size="lg" variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444', fontWeight: 'bold' }}>
                        Envoyer le signalement
                    </Button>
                </div>

            </form>
        </div>
    );
}
