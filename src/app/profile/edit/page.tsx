'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Camera, Image as ImageIcon, Save, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfileEditPage() {
    const router = useRouter();

    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("https://randomuser.me/api/portraits/men/32.jpg");

    const [formData, setFormData] = useState({
        name: "Modou Fall",
        job: "Mécanicien Expert",
        location: "Rufisque, Dakar",
        bio: "Spécialiste des pannes moteurs et électronique auto. Disponible 7j/7 pour intervention rapide sur Dakar et banlieue."
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
            alert("Photo de profil mise à jour !");

        } catch (error) {
            alert('Erreur upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API update
        console.log("Saving profile:", formData);
        router.push('/profile/view');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '2rem' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color="#0F172A" />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Modifier mon profil</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Avatar Edit */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#E2E8F0', border: '4px solid white', backgroundImage: `url("${avatarUrl}")`, backgroundSize: 'cover', position: 'relative' }}>
                        <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary)', padding: '0.4rem', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {uploading ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
                        </label>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Changer la photo</span>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nom / Enseigne</label>
                        <input
                            type="text" className="input" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Métier / Spécialité</label>
                        <input
                            type="text" className="input" placeholder="Ex: Plombier, Couturier..." required
                            value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ville / Quartier</label>
                        <input
                            type="text" className="input" required
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Biographie</label>
                        <textarea
                            className="input" rows={4} placeholder="Décrivez vos compétences..."
                            value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            style={{ fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                {/* Portfolio Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Mes Réalisations</h3>
                        <button type="button" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ImageIcon size={16} /> Ajouter
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div style={{ aspectRatio: '1/1', borderRadius: '8px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=300&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ aspectRatio: '1/1', borderRadius: '8px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ aspectRatio: '1/1', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #CBD5E1', cursor: 'pointer' }}>
                            <div style={{ fontSize: '2rem', color: '#CBD5E1' }}>+</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <Button fullWidth size="lg">
                        <Save size={20} style={{ marginRight: '0.5rem' }} /> Enregistrer
                    </Button>
                </div>

            </form>
        </div>
    );
}
