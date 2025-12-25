'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    ShieldCheck, Trash2, Users, Megaphone, CheckCircle, XCircle, Layout, ArrowLeft,
    Settings, Power, UserX, AlertTriangle, PlayCircle, Palette, Lock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Admin Modules
type AdminTab = 'verification' | 'moderation' | 'users' | 'marketing' | 'system';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>('verification');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Data States
    const [verifications, setVerifications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, activePosts: 0, totalCommission: 0 });

    // Config States (System Module)
    const [themeColor, setThemeColor] = useState('#10B981');
    const [splashAd, setSplashAd] = useState({ active: true, url: '', link: '' });

    useEffect(() => {
        checkAdmin();
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        if (activeTab === 'verification') fetchVerifications();
        if (activeTab === 'moderation') { fetchPosts(); fetchStats(); }
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, isAdmin]);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        // Mock Admin Check (Real impl would check 'admin_roles' table)
        setIsAdmin(true);
        setLoading(false);
    };

    // --- FETCHERS ---
    const fetchVerifications = async () => {
        setLoading(true);
        const { data } = await supabase.from('verification_docs').select('*, profiles:user_id (full_name, avatar_url, phone)').eq('status', 'pending');
        if (data) setVerifications(data);
        setLoading(false);
    };

    const fetchPosts = async () => {
        setLoading(true);
        const { data } = await supabase.from('posts').select('*, profiles:user_id (full_name)').order('created_at', { ascending: false });
        if (data) setPosts(data);
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        // Note: 'profiles' is the public table. 
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) setUsers(data);
        setLoading(false);
    };

    const fetchStats = async () => {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        setStats({ totalUsers: userCount || 0, activePosts: postCount || 0, totalCommission: 125000 }); // Mock commission
    };

    // --- ACTIONS ---
    const handleVerify = async (docId: number, userId: string, approved: boolean) => {
        if (!confirm("Confirmer l'action ?")) return;
        await supabase.from('verification_docs').update({ status: approved ? 'verified' : 'rejected' }).eq('id', docId);
        await supabase.from('profiles').update({ is_verified: approved, verification_status: approved ? 'verified' : 'rejected' }).eq('id', userId);
        fetchVerifications();
    };

    const handleForceDeletePost = async (postId: number) => {
        if (!confirm("BANNIR cette annonce ? Irréversible.")) return;
        await supabase.from('posts').delete().eq('id', postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const handleBanUser = async (userId: string) => {
        // In reality, we would set a 'banned_at' flag. simulating deletion for now or meta update.
        if (!confirm("BANNIR cet utilisateur ? Il ne pourra plus se connecter.")) return;
        alert("Utilisateur banni (Simulation)");
    };

    const handleUpdateTheme = (color: string) => {
        setThemeColor(color);
        // Inject into CSS root (Live Preview)
        document.documentElement.style.setProperty('--primary', color);
        // Save to DB (app_settings) would go here
        alert(`Thème passé en ${color} ! (Simulation)`);
    };

    if (loading && !isAdmin) return <div className="p-8 text-center">Chargement Admin...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex' }}>

            {/* SIDEBAR */}
            <aside style={{ width: '250px', backgroundColor: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #1E293B' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck color="#10B981" /> Admin
                    </h1>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>Xarr-Matt SuperPanel</div>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <SidebarItem active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} icon={<CheckCircle size={20} />} label="Validations" count={verifications.length} />
                    <SidebarItem active={activeTab === 'moderation'} onClick={() => setActiveTab('moderation')} icon={<AlertTriangle size={20} />} label="Modération" />
                    <SidebarItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20} />} label="Utilisateurs" />
                    <SidebarItem active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} icon={<Megaphone size={20} />} label="Marketing" />
                    <div style={{ margin: '1rem 0', borderTop: '1px solid #1E293B' }} />
                    <SidebarItem active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Settings size={20} />} label="Système" />
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #1E293B' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Retour Site
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <header style={{ backgroundColor: 'white', padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{activeTab}</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>Super Admin</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Connecté</div>
                        </div>
                    </div>
                </header>

                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* --- MODULE 1: VALIDATION --- */}
                    {activeTab === 'verification' && (
                        <div className="grid gap-4">
                            {verifications.length === 0 && <div className="card p-8 text-center text-gray-500">Aucune demande en attente. Tout est propre ! ✨</div>}
                            {verifications.map(doc => (
                                <div key={doc.id} className="card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                    <div style={{ flex: 1 }}>
                                        <h3 className="font-bold text-lg">{doc.profiles?.full_name}</h3>
                                        <p className="text-gray-500 text-sm">Tel: {doc.profiles?.phone}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={() => handleVerify(doc.id, doc.user_id, true)} style={{ backgroundColor: '#10B981' }} size="sm"><CheckCircle size={16} className="mr-2" /> Valider</Button>
                                            <Button onClick={() => handleVerify(doc.id, doc.user_id, false)} style={{ backgroundColor: '#EF4444' }} size="sm"><XCircle size={16} className="mr-2" /> Rejeter</Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <img src={getStorageUrl(doc.recto_url)} className="h-24 w-40 object-cover rounded bg-gray-100 border" alt="Recto" />
                                        <img src={getStorageUrl(doc.verso_url)} className="h-24 w-40 object-cover rounded bg-gray-100 border" alt="Verso" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- MODULE 2: MODERATION --- */}
                    {activeTab === 'moderation' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <StatCard label="Utilisateurs Total" value={stats.totalUsers} icon={<Users color="#3B82F6" />} />
                                <StatCard label="Annonces Actives" value={stats.activePosts} icon={<Layout color="#8B5CF6" />} />
                                <StatCard label="Commissions (Est.)" value={`${stats.totalCommission} F`} icon={<Layout color="#F59E0B" />} />
                            </div>

                            <h3 className="font-bold text-lg mb-4">Annonces récentes</h3>
                            {posts.map(post => (
                                <div key={post.id} className="bg-white p-4 rounded-lg border flex justify-between items-center mb-2">
                                    <div>
                                        <div className="font-bold">{post.title}</div>
                                        <div className="text-sm text-gray-500">{post.price} FCFA • Par {post.profiles?.full_name}</div>
                                    </div>
                                    <button onClick={() => handleForceDeletePost(post.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- MODULE 3: USERS (NOUVEAU) --- */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Nom</th>
                                        <th style={{ padding: '1rem' }}>Rôle</th>
                                        <th style={{ padding: '1rem' }}>Statut</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div className="font-medium">{user.full_name || 'Anonyme'}</div>
                                                <div className="text-xs text-gray-400">{user.id.substring(0, 8)}...</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`px-2 py-1 rounded-full text-xs ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.is_verified ? 'Vérifié' : 'Standard'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}><span className="text-green-600 text-sm">Actif</span></td>
                                            <td style={{ padding: '1rem' }}>
                                                <button onClick={() => handleBanUser(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Bannir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- MODULE 4: MARKETING --- */}
                    {activeTab === 'marketing' && (
                        <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="card bg-white p-6 rounded-xl border">
                                <h3 className="font-bold flex items-center gap-2 mb-4"><PlayCircle size={20} /> Splash Screen (Pub Démarrage)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Image URL</label>
                                        <input type="text" className="w-full p-2 border rounded" placeholder="https://..." value={splashAd.url} onChange={e => setSplashAd({ ...splashAd, url: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Lien Redirection</label>
                                        <input type="text" className="w-full p-2 border rounded" placeholder="https://client.com" value={splashAd.link} onChange={e => setSplashAd({ ...splashAd, link: e.target.value })} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={splashAd.active} onChange={e => setSplashAd({ ...splashAd, active: e.target.checked })} />
                                        <span className="text-sm">Activer la publicité</span>
                                    </div>
                                    <Button fullWidth onClick={() => alert("Config Splash Ad Sauvegardée !")}>Sauvegarder</Button>
                                </div>
                            </div>

                            <div className="card bg-white p-6 rounded-xl border">
                                <h3 className="font-bold flex items-center gap-2 mb-4"><Palette size={20} /> Thème Dynamique</h3>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">Changez la couleur principale de l'application en temps réel.</p>
                                    <div className="flex gap-2">
                                        {['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => handleUpdateTheme(color)}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color, border: themeColor === color ? '2px solid black' : 'none', cursor: 'pointer' }}
                                            />
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-lg text-white text-center font-bold" style={{ backgroundColor: themeColor }}>
                                        Aperçu Bouton
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODULE 5: SYSTEM --- */}
                    {activeTab === 'system' && (
                        <div className="card bg-white p-8 text-center rounded-xl border">
                            <h3 className="font-bold text-xl mb-4">Maintenance & Urgences</h3>
                            <p className="text-gray-500 mb-8">Zone de danger. Actions irréversibles ou impactant tout le trafic.</p>

                            <div className="flex justify-center gap-4">
                                <Button style={{ backgroundColor: '#EF4444' }}><Power size={18} className="mr-2" /> Activer Mode Maintenance</Button>
                                <Button style={{ backgroundColor: '#F59E0B' }}><Megaphone size={18} className="mr-2" /> Envoyer Broadcast Push</Button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

// Helpers
const SidebarItem = ({ icon, label, active, onClick, count }: any) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem',
            borderRadius: '8px', marginBottom: '0.5rem',
            backgroundColor: active ? '#1E293B' : 'transparent', color: active ? 'white' : '#94A3B8',
            cursor: 'pointer', border: 'none', textAlign: 'left', fontWeight: 500
        }}
    >
        {icon}
        <span style={{ flex: 1 }}>{label}</span>
        {count > 0 && <span style={{ fontSize: '0.75rem', backgroundColor: '#10B981', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>{count}</span>}
    </button>
);

const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
            <div className="text-gray-500 text-sm">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
);

const getStorageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/verification_docs/${path}`;
}
