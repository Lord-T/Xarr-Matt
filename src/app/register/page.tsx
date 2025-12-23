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

        let emailToSubmit = '';

        if (method === 'email') {
            emailToSubmit = formData.email;
        } else {
            // Format phone: remove spaces, add suffix
            const cleanPhone = formData.phone.replace(/\s/g, '');
            const fullPhone = `${formData.countryCode.replace('+', '')}${cleanPhone}`;
            // Result ex: 221770000000@xarr-matt.com
            emailToSubmit = `${fullPhone}@xarr-matt.com`;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: emailToSubmit,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: method === 'phone' ? formData.phone : null,
                        signup_method: method
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
                <p style={{ color: 'var(--muted)' }}>Choisissez votre méthode préférée.</p>
            </div>

            {/* Toggle Method */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        backgroundColor: method === 'phone' ? 'var(--primary)' : '#E2E8F0',
                        color: method === 'phone' ? 'white' : '#64748B', fontWeight: 600
                    }}
                >
                    📱 Téléphone
                </button>
                <button
                    type="button"
                    onClick={() => setMethod('email')}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        backgroundColor: method === 'email' ? 'var(--primary)' : '#E2E8F0',
                        color: method === 'email' ? 'white' : '#64748B', fontWeight: 600
                    }}
                >
                    📧 Email
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom Complet</label>
                    <input
                        type="text" required className="input" placeholder="Ex: Modou Diop"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                {method === 'phone' ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Numéro de téléphone</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                className="input"
                                style={{ width: '100px', cursor: 'pointer' }}
                                value={formData.countryCode}
                                onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                            >
                                <option value="+221">🇸🇳 +221</option>
                                <option value="+33">🇫🇷 +33</option>
                                <option value="+1">🇺🇸 +1</option>
                            </select>
                            <input
                                type="tel" required className="input" placeholder="77 000 00 00" style={{ flex: 1 }}
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adresse Email</label>
                        <input
                            type="email" required className="input" placeholder="monadresse@email.com"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mot de passe</label>
                    <input
                        type="password" required className="input" placeholder="••••••••"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </Button>
                </div>
            </form>

        </div>
    );
}
