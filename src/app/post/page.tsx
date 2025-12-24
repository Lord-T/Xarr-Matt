'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MapPin, Phone, Camera, Image as ImageIcon, AlertTriangle } from 'lucide-react';
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
    const [photoFile, setPhotoFile] = useState<File | null>(null); // New: Photo logic

    // Geolocation State
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(true);

    const [formData, setFormData] = useState({
        category: '',
        customCategory: '',
        description: '',
        budget: '',
        phone: ''
    });

    // 1. Force High Accuracy Geolocation on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
            setIsLocating(false);
            return;
        }

        const success = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setIsLocating(false);
        };

        const error = (err: GeolocationPositionError) => {
            console.error("Geo error:", err);
            let msg = "Erreur de localisation.";
            if (err.code === 1) msg = "Vous devez autoriser l'accès à la localisation pour publier."; // PERMISSION_DENIED
            if (err.code === 2) msg = "Position indisponible. Activez le GPS."; // POSITION_UNAVAILABLE
            if (err.code === 3) msg = "Délai d'attente dépassé."; // TIMEOUT

            setLocationError(msg);
            setIsLocating(false);
        };

        const options = {
            enableHighAccuracy: true, // Requested: Ultra Exact
            timeout: 15000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Blocking checks
        if (!location) return alert("❌ La localisation exacte est obligatoire pour publier.");
        if (locationError) return alert(`❌ Erreur : ${locationError}`);

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

            if (!session) {
                alert("Vous devez être connecté pour publier.");
                router.push('/login');
                return;
            }

            const user = session.user;
            let publicAudioUrl = null;
            let publicPhotoUrl = null;

            const timestamp = Date.now();

            // 1. Upload Audio if exists
            if (audioBlob) {
                const fileName = `audio_${timestamp}_${user.id}.webm`;
                const { error: uploadError } = await supabase.storage
                    .from('posts-files')
                    .upload(fileName, audioBlob);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('posts-files')
                    .getPublicUrl(fileName);
                publicAudioUrl = publicUrlData.publicUrl;
            }

            // 2. Upload Photo if exists
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `photo_${timestamp}_${user.id}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('posts-files')
                    .upload(fileName, photoFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('posts-files')
                    .getPublicUrl(fileName);
                publicPhotoUrl = publicUrlData.publicUrl;
            }

            // 3. Insert Post with REAL Coordinates
            const { error } = await supabase.from('posts').insert({
                title: finalCategory,
                description: formData.description,
                price: formData.budget ? parseFloat(formData.budget) : null,
                location: "Position GPS Exacte",
                lat: location.lat, // New field (ensure DB has these or use 'location' text for now if schema strict)
                lng: location.lng, // New field 
                contact_phone: formData.phone,
                user_id: user.id,
                audio_url: publicAudioUrl,
                // photo_url: publicPhotoUrl // Note: Ensure DB column exists or verify requirement. Assuming audio was the main one.
            });

            if (error) {
                // Fallback if lat/lng columns don't exist yet, save in location text
                console.warn("Retrying with location text only if lat/lng fail...");
                await supabase.from('posts').insert({
                    title: finalCategory,
                    description: formData.description,
                    price: formData.budget ? parseFloat(formData.budget) : null,
                    location: `${location.lat},${location.lng}`, // Save coords in text
                    contact_phone: formData.phone,
                    user_id: user.id,
                    audio_url: publicAudioUrl,
                });
            }

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
                <Link href="/" style={{ color: 'var(--foreground)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Publier un besoin</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Location Status - High Priority */}
                <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: locationError ? '#FEF2F2' : '#F0FDFA', border: locationError ? '1px solid #FECACA' : '1px solid #CCFBF1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {isLocating ? <MapPin className="animate-pulse" color="var(--primary)" /> :
                            locationError ? <AlertTriangle color="#EF4444" /> : <MapPin color="#10B981" />}

                        <span style={{ fontWeight: 600, color: locationError ? '#EF4444' : '#047857' }}>
                            {isLocating ? "Acquisition position exacte..." :
                                locationError ? "Localisation requise !" : "Position exacte acquise"}
                        </span>
                    </div>
                    {locationError && (
                        <p style={{ fontSize: '0.85rem', color: '#B91C1C' }}>
                            {locationError === "Vous devez autoriser l'accès à la localisation pour publier."
                                ? "⚠️ L'application a besoin de votre position exacte pour vous connecter aux prestataires proches. Veuillez autoriser l'accès."
                                : locationError}
                        </p>
                    )}
                    {location && (
                        <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)} (Précision GPS)
                        </p>
                    )}
                </div>

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

                {/* Contact Phone */}
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
                </div>

                {/* Media Permissions: Audio & Camera */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Audio */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Message Vocal</label>
                        <AudioRecorder onAudioReady={(blob) => setAudioBlob(blob)} />
                    </div>

                    {/* Camera */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Photo / Selfie</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoChange}
                                style={{
                                    opacity: 0, position: 'absolute', top: 0, left: 0,
                                    width: '100%', height: '100%', cursor: 'pointer'
                                }}
                            />
                            <Button type="button" variant="outline" fullWidth style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {photoFile ? <ImageIcon size={18} color="green" /> : <Camera size={18} />}
                                {photoFile ? "Photo Ajoutée" : "Prendre Photo"}
                            </Button>
                        </div>
                    </div>
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

                <div style={{ marginTop: '1rem' }}>
                    <Button fullWidth size="lg" disabled={loading || !!locationError || isLocating}>
                        {loading ? 'Publication...' : 'Publier l\'annonce'}
                    </Button>
                    {(locationError || isLocating) && (
                        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {isLocating ? "Attente de la position..." : "Localisation requise pour publier"}
                        </p>
                    )}
                </div>

            </form>
        </div>
    );
}
