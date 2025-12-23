'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<'phone' | 'email'>('phone');

    // Auth State
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+221');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let emailToSubmit = '';

        if (method === 'email') {
            emailToSubmit = email;
        } else {
            // CORRECTION: Utiliser \D pour tout nettoyer sauf les chiffres (comme à l'inscription)
            const cleanPhone = phone.replace(/\D/g, '');
            const cleanCountry = countryCode.replace(/\D/g, '');
            const fullPhone = `${cleanCountry}${cleanPhone}`;
            emailToSubmit = `${fullPhone}@xarr-matt.com`;
        }

        console.log("Tentative connexion:", emailToSubmit); // Debug log

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToSubmit,
                password: password,
            });

            if (error) throw error;

            console.log("Connexion réussie:", data);
            router.push('/');
        } catch (err: any) {
            alert("Erreur de connexion : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'var(--background)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Connexion Xarr-Matt</h1>

                {/* Toggle Method */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        type="button"
                        onClick={() => setMethod('phone')}
                        style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer',
                            backgroundColor: method === 'phone' ? 'var(--primary)' : 'white',
                            color: method === 'phone' ? 'white' : 'var(--muted)', fontWeight: 600
                        }}
                    >
                        Téléphone
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod('email')}
                        style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer',
                            backgroundColor: method === 'email' ? 'var(--primary)' : 'white',
                            color: method === 'email' ? 'white' : 'var(--muted)', fontWeight: 600
                        }}
                    >
                        Email
                    </button>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleLogin}>

                    {method === 'phone' ? (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Numéro de téléphone</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    className="input"
                                    style={{ width: '80px', padding: '0.5rem' }}
                                    value={countryCode}
                                    onChange={e => setCountryCode(e.target.value)}
                                >
                                    <option value="+221">🇸🇳</option>
                                    <option value="+33">🇫🇷</option>
                                    <option value="+1">🇺🇸</option>
                                </select>
                                <input
                                    type="tel" placeholder="77 000 00 00" className="input" style={{ flex: 1 }}
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                            <input
                                type="email" placeholder="monemail@exemple.com" className="input"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Mot de passe</label>
                        <input
                            type="password" placeholder="••••••" className="input"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Button fullWidth disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Pas encore de compte ? <Link href="/register" className="text-primary font-medium hover:underline">S'inscrire</Link>
                </p>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        (Problème ? Nettoyer ma session)
                    </button>
                </div>
            </div>
        </div>
    );
}
