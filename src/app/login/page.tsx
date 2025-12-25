'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("Tentative connexion:", email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
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

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleLogin}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemple@email.com"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Votre mot de passe"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <Button fullWidth size="lg" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Pas encore de compte ? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>S'inscrire</Link>
                </div>

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
