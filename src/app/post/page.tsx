'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { AudioRecorder } from '@/components/AudioRecorder';
import { supabase } from '@/lib/supabase';

const SERVICES = [
    'Plomberie', 'Électricité', 'Mécanique', 'Cuisine',
    'Bricolage', 'Transport', 'Couture', 'Coiffure', 'Autres'
];

export default function PostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [formData, setFormData] = useState({
        category: '',
        customCategory: '',
        description: '',
        budget: '',
        phone: ''
    });

    // ... (useEffect remains same) ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category) return alert("Veuillez choisir une catégorie");

        let finalCategory = formData.category;
        if (formData.category === 'Autres') {
            if (!formData.customCategory.trim()) return alert("Veuillez préciser la catégorie");
            finalCategory = formData.customCategory.trim();
        }

        if (!formData.phone) return alert("Le numéro de téléphone est obligatoire");

        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Session active:", session);

            if (!session) {
                alert("Vous devez être connecté pour publier.");
                router.push('/login');
                return;
            }

            const user = session.user;
            let publicAudioUrl = null;

            // 1. Upload Audio if exists
            if (audioBlob) {
                const fileName = `audio_${Date.now()}_${user.id}.webm`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('posts-files')
                    .upload(fileName, audioBlob);

                if (uploadError) throw uploadError;

                // 2. Get Public URL
                const { data: publicUrlData } = supabase.storage
                    .from('posts-files')
                    .getPublicUrl(fileName);

                publicAudioUrl = publicUrlData.publicUrl;
            }

            // 3. Insert Post
            const { error } = await supabase.from('posts').insert({
                title: finalCategory,
                description: formData.description,
                price: formData.budget ? parseFloat(formData.budget) : null,
                location: "Position GPS (Simulée)",
                contact_phone: formData.phone,
                user_id: user.id,
                audio_url: publicAudioUrl // Save URL to DB
            });

            if (error) throw error;

            alert("✅ Annonce publiée avec succès !");
            router.push('/');

        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de la publication : " + err.message);
        } finally {
            setLoading(false);
        }



    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
                <Link href="/" style={{ color: 'var(--foreground)' }}> {/* Redirect to Home */}
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Publier un besoin</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Category Selection */}
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Catégorie du besoin</label>
                    <select
                        className="input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: 'white' }}
                    >
                        <option value="">Sélectionner...</option>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Conditional Input for 'Autres' */}
                    {formData.category === 'Autres' && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>Précisez le type de service :</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ex: Jardinage, Cours particuliers..."
                                value={formData.customCategory}
                                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>

                {/* Contact Phone - CRITICAL */}
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Numéro de contact (Public)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                        <Phone size={20} color="var(--primary)" />
                        <input
                            type="tel"
                            className="input"
                            placeholder="77 000 00 00"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            style={{ border: 'none', flex: 1, padding: 0 }}
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        Ce numéro permettra aux prestataires de vous appeler directement.
                    </p>
                </div>

                {/* Audio Recording */}
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Message Vocal (Optionnel)</label>
                    <AudioRecorder onAudioReady={(blob) => setAudioBlob(blob)} />
                </div>

                {/* Text Description */}
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Description détaillée</label>
                    <textarea
                        className="input"
                        rows={4}
                        placeholder="Décrivez votre problème..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', resize: 'none' }}
                    />
                </div>

                {/* Budget */}
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Votre Budget (FCFA)</label>
                    <input
                        type="number"
                        placeholder="Ex: 5000"
                        className="input"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Location (Simulated) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                    <MapPin size={16} />
                    <span>Localisation actuelle utilisée (GPS)</span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Publication...' : 'Publier l\'annonce'}
                    </Button>
                </div>

            </form>
        </div>
    );
}
