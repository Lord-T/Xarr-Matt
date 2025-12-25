'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Trash2, Users, Megaphone, CheckCircle, XCircle, Layout, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'verification' | 'moderation' | 'marketing'>('verification');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Data States
    const [verifications, setVerifications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [banners, setBanners] = useState([
        { id: 1, title: 'Promo Ramadan', image: 'https://via.placeholder.com/350x100', active: true },
        { id: 2, title: 'Partenaire Orange', image: 'https://via.placeholder.com/350x100', active: false },
    ]);

    useEffect(() => {
        checkAdmin();
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        if (activeTab === 'verification') fetchVerifications();
        if (activeTab === 'moderation') fetchPosts();
    }, [activeTab, isAdmin]);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        // TODO: Add real Admin Check (e.g. user.email === 'admin@xarr.com')
        setIsAdmin(true);
        setLoading(false);
    };

    const fetchVerifications = async () => {
        setLoading(true);
        // Fetch pending docs with user profile data
        // Note: We join with profiles to get names
        const { data, error } = await supabase
            .from('verification_docs')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url, phone)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setVerifications(data);
        setLoading(false);
    };

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .order('created_at', { ascending: false });

        if (data) setPosts(data);
        setLoading(false);
    };

    // Actions
    const handleVerify = async (docId: number, userId: string, approved: boolean) => {
        if (!confirm(approved ? "Valider ce profil ?" : "Rejeter cette demande ?")) return;

        // 1. Update Doc Status
        await supabase
            .from('verification_docs')
            .update({ status: approved ? 'verified' : 'rejected' })
            .eq('id', docId);

        // 2. If Approved, Update Profile
        if (approved) {
            await supabase
                .from('profiles')
                .update({ is_verified: true, verification_status: 'verified' })
                .eq('id', userId);
        } else {
            await supabase
                .from('profiles')
                .update({ verification_status: 'rejected' })
                .eq('id', userId);
        }

        fetchVerifications(); // Refresh
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm("ATTENTION : Supprimer cette annonce définitivement ?")) return;

        await supabase.from('posts').delete().eq('id', postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    if (loading && !isAdmin) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#1E293B', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ color: 'white' }}><ArrowLeft /></Link>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel 👮</h1>
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Super Admin</div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', backgroundColor: 'white', padding: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <button
                    onClick={() => setActiveTab('verification')}
                    style={{ flex: 1, padding: '0.75rem', borderBottom: activeTab === 'verification' ? '2px solid #10B981' : 'none', fontWeight: 600, color: activeTab === 'verification' ? '#10B981' : '#64748B' }}
                >
                    Validations ({verifications.length})
                </button>
                <button
                    onClick={() => setActiveTab('moderation')}
                    style={{ flex: 1, padding: '0.75rem', borderBottom: activeTab === 'moderation' ? '2px solid #10B981' : 'none', fontWeight: 600, color: activeTab === 'moderation' ? '#10B981' : '#64748B' }}
                >
                    Modération
                </button>
                <button
                    onClick={() => setActiveTab('marketing')}
                    style={{ flex: 1, padding: '0.75rem', borderBottom: activeTab === 'marketing' ? '2px solid #10B981' : 'none', fontWeight: 600, color: activeTab === 'marketing' ? '#10B981' : '#64748B' }}
                >
                    Marketing
                </button>
            </div>

            {/* Content */}
            <main style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>

                {/* VERIFICATIONS TAB */}
                {activeTab === 'verification' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {verifications.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Aucune demande en attente.</div>}

                        {verifications.map((doc) => (
                            <div key={doc.id} className="card" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 'bold' }}>{doc.profiles?.full_name || 'Utilisateur Inconnu'}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Tel: {doc.profiles?.phone}</p>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '99px', height: 'fit-content' }}>
                                        En attente
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', overflowX: 'auto' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>Recto</div>
                                        <img src={doc.recto_url.startsWith('http') ? doc.recto_url : `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/verification_docs/${doc.recto_url}`}
                                            alt="Recto" style={{ height: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>Verso</div>
                                        <img src={doc.verso_url.startsWith('http') ? doc.verso_url : `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/verification_docs/${doc.verso_url}`}
                                            alt="Verso" style={{ height: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button onClick={() => handleVerify(doc.id, doc.user_id, true)} style={{ flex: 1, backgroundColor: '#10B981' }}>
                                        <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Valider
                                    </Button>
                                    <Button onClick={() => handleVerify(doc.id, doc.user_id, false)} style={{ flex: 1, backgroundColor: '#EF4444' }}>
                                        <XCircle size={18} style={{ marginRight: '0.5rem' }} /> Refuser
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODERATION TAB */}
                {activeTab === 'moderation' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px' }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Statistiques</h3>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div>Total Annonces: <strong>{posts.length}</strong></div>
                                <div>Actives: <strong>{posts.filter(p => p.status === 'available').length}</strong></div>
                            </div>
                        </div>

                        {posts.map((post) => (
                            <div key={post.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{post.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Par {post.profiles?.full_name} • {post.price} FCFA</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(post.created_at).toLocaleDateString()}</div>
                                </div>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    style={{ padding: '0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* MARKETING TAB */}
                {activeTab === 'marketing' && (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
                        <Megaphone size={48} style={{ margin: '0 auto 1rem auto', color: '#10B981' }} />
                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Gestion Publicité</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>Ce module permettra d'injecter des bannières entre les annonces.</p>
                        <Button disabled>Bientôt Disponible</Button>
                    </div>
                )}

            </main>
        </div>
    );
}
