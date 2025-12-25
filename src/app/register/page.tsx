'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<'phone' | 'email'>('phone'); // 'phone' or 'email'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+221',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean phone for storage
            const cleanPhone = formData.phone.replace(/\s/g, '');
            const fullPhone = `${formData.countryCode.replace('+', '')}${cleanPhone}`;

            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: fullPhone, // Stored as User Metadata
                        signup_method: 'email'
                    }
                }
            });

            if (error) throw error;

            console.log("Inscription réussie:", data);
            router.push('/onboarding');
        } catch (err: any) {
            alert("Erreur: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>

            <div style={{ marginBottom: '2rem' }}>
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                    <ArrowLeft size={20} /> Retour
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>Créer un compte</h1>
                <p style={{ color: 'var(--muted)' }}>Rejoignez la communauté Xarr-Matt.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Name */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prénom & Nom</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Moussa Diop"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                </div>

                {/* Email */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="moussa@exemple.com"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                </div>

                {/* Phone (Contact Info) */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Téléphone (Contact)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={formData.countryCode}
                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#f8fafc', fontWeight: 600 }}
                        >
                            <option value="+221">🇸🇳 +221</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+1">🇺🇸 +1</option>
                        </select>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="77 000 00 00"
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Mot de passe</label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="8 caractères minimum"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    />
                </div>


                <div style={{ marginTop: '1rem' }}>
                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Création...' : "S'inscrire"}
                    </Button>
                </div>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                En vous inscrivant, vous acceptez nos <Link href="/cgv" style={{ textDecoration: 'underline' }}>Conditions d'utilisation</Link>.
            </p>
        </div>
    );
}
