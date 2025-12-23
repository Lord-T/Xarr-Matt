'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MapPin, Building, User, FileText, Phone, Camera } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const SERVICES = [
    'Plomberie', 'Électricité', 'Mécanique', 'Cuisine',
    'Bricolage', 'Transport', 'Couture', 'Coiffure', 'Commerçant', 'Santé', 'Éducation', 'Autres'
];

export default function BecomeProviderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        businessName: '',
        phone: '',
        category: '',
        customCategory: '',
        bio: '',
        ninea: '',
        rccm: '',
        avatarUrl: '', // New field
        latitude: null as number | null,
        longitude: null as number | null,
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            // Pre-fill phone if available
            if (user.user_metadata?.phone) {
                setFormData(prev => ({ ...prev, phone: user.user_metadata.phone }));
            }
        };
        checkUser();
    }, [router]);

    const handleGeolocate = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur");
            setLocationStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setLocationStatus('success');
            },
            (error) => {
                console.error("Error identifying location:", error);
                alert("Impossible de vous localiser. Veuillez vérifier vos autorisations GPS.");
                setLocationStatus('error');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.businessName || !formData.phone || !formData.category) {
            alert("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        if (formData.category === 'Autres' && !formData.customCategory) {
            alert("Veuillez préciser votre catégorie");
            return;
        }

        if (formData.latitude === null || formData.longitude === null) {
            alert("La géolocalisation est obligatoire pour apparaître sur la carte. Cliquez sur '📍 Ma position actuelle'.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utilisateur non connecté");

            const finalCategory = formData.category === 'Autres' ? formData.customCategory : formData.category;
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: formData.phone,
                    business_name: formData.businessName,
                    service_category: finalCategory,
                    bio: formData.bio,
                    ninea: formData.ninea || null,
                    rccm: formData.rccm || null,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    is_provider: true,
                    avatar_url: formData.avatarUrl, // Save avatar URL
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            alert("🎉 Félicitations ! Votre profil Business est activé.");
            router.push('/map'); // Redirect to map to see the result

        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de l'enregistrement : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
                <Link href="/" style={{ color: 'var(--foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Devenir Prestataire</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>

                <div style={{ backgroundColor: '#DBEAFE', padding: '1rem', borderRadius: '8px', color: '#1E40AF', fontSize: '0.9rem' }}>
                    ℹ️ <strong>Pourquoi devenir prestataire ?</strong><br />
                    Pour être visible sur la carte et recevoir des appels de clients autour de vous. C'est gratuit !
                </div>

                {/* Photo de Profil */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        position: 'relative', border: '2px solid var(--primary)'
                    }}>
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Camera size={32} color="#9CA3AF" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Preview
                                const objectUrl = URL.createObjectURL(file);
                                setFormData(prev => ({ ...prev, avatarUrl: objectUrl })); // Temp preview

                                // Upload logic will happen on submit or improved here? 
                                // Let's upload immediately for simplicity or store file?
                                // Storing file in state to upload on submit is better but for UX immediate upload is cool.
                                // Let's do upload on submit to simpler state management, but we need to store the FILE.
                                // Actually, I'll add a 'file' to state or just upload here to get the URL immediately.
                                // Upload immediately is easier for the URL field.

                                try {
                                    setLoading(true);
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `profiles/${Date.now()}.${fileExt}`;
                                    const { error: uploadError } = await supabase.storage.from('posts-files').upload(fileName, file);

                                    if (uploadError) throw uploadError;

                                    const { data: { publicUrl } } = supabase.storage.from('posts-files').getPublicUrl(fileName);
                                    setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
                                } catch (error) {
                                    alert('Erreur upload: ' + error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {loading ? 'Envoi en cours...' : '📸 Ajouter une photo / logo'}
                    </span>
                </div>

                {/* Identité */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={18} /> Identité du Gérant
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label">Prénom *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Moussa"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Nom *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Diop"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Numéro de téléphone *</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Phone size={18} className="text-muted" />
                            <input
                                type="tel"
                                style={{ border: 'none', width: '100%', outline: 'none' }}
                                placeholder="77 000 00 00"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Business Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building size={18} /> L'Entreprise / Atelier
                    </h2>

                    <div>
                        <label className="label">Nom du Business *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Atelier Mécanique Général, La Boutique du Coin..."
                            value={formData.businessName}
                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Catégorie d'activité *</label>
                        <select
                            className="input"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                            style={{ width: '100%', backgroundColor: 'white' }}
                        >
                            <option value="">Choisir une activité...</option>
                            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {formData.category === 'Autres' && (
                        <div>
                            <label className="label">Précisez votre activité *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ex: Jardinage, Consultant..."
                                value={formData.customCategory}
                                onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="label">Description courte (Bio)</label>
                        <textarea
                            className="input"
                            rows={3}
                            placeholder="Décrivez vos services, vos horaires..."
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            style={{ width: '100%', resize: 'none' }}
                        />
                    </div>
                </div>

                {/* Documents Officiels (Facultatif) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--muted)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                        <FileText size={18} /> Administratif (Facultatif)
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label" style={{ color: 'var(--muted)' }}>NINEA</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Optionnel"
                                value={formData.ninea}
                                onChange={e => setFormData({ ...formData, ninea: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label" style={{ color: 'var(--muted)' }}>RCCM</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Optionnel"
                                value={formData.rccm}
                                onChange={e => setFormData({ ...formData, rccm: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Localisation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} /> Localisation *
                    </h2>

                    <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Placez-vous physiquement à votre lieu de travail puis cliquez sur le bouton.
                        </p>

                        <button
                            type="button"
                            onClick={handleGeolocate}
                            disabled={locationStatus === 'loading' || locationStatus === 'success'}
                            className="btn"
                            style={{
                                width: '100%',
                                backgroundColor: locationStatus === 'success' ? '#16A34A' : 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            {locationStatus === 'loading' ? 'Localisation en cours...' :
                                locationStatus === 'success' ? 'Position enregistrée ✅' :
                                    '📍 Ma position actuelle'}
                        </button>

                        {formData.latitude && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                                Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Mise à jour...' : 'Activer / Mettre à jour mon Profil'}
                    </Button>

                    <button
                        type="button"
                        onClick={async () => {
                            if (!confirm("Voulez-vous vraiment disparaître de la carte ? Les clients ne pourront plus vous trouver.")) return;
                            setLoading(true);
                            const { error } = await supabase.from('profiles').update({ is_provider: false, latitude: null, longitude: null }).eq('id', (await supabase.auth.getUser()).data.user?.id);
                            setLoading(false);
                            if (error) alert("Erreur: " + error.message);
                            else { alert("Vous n'êtes plus visible sur la carte."); router.push('/'); }
                        }}
                        style={{
                            background: 'none', border: '1px solid #EF4444', color: '#EF4444',
                            padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        🚫 Me retirer de la carte
                    </button>
                </div>

            </form>

            <style jsx>{`
                .label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                    font-size: 0.9rem;
                }
                .input {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    width: 100%;
                    font-size: 1rem;
                }
                .input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                }
            `}</style>
        </div>
    );
}
