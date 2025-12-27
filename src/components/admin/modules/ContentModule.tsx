'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, Plus, Trash2, ToggleLeft, ToggleRight, Layers, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function ContentModule() {
    const [subTab, setSubTab] = useState<'posts' | 'banners' | 'categories' | 'reports'>('posts');

    // Data States
    const [banners, setBanners] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter/Search for Posts
    const [postSearch, setPostSearch] = useState('');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const { data: bData } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        const { data: cData } = await supabase.from('categories').select('*').order('name');

        // Fetch Posts with User details
        const { data: pData } = await supabase
            .from('posts')
            .select('*, profiles(full_name, phone)')
            .order('created_at', { ascending: false });

        if (bData) setBanners(bData);
        if (cData) setCategories(cData);
        if (pData) setPosts(pData);
        setLoading(false);
    };

    // --- Actions ---
    const handleAddBanner = async (url: string) => {
        if (!url) return;
        const { data } = await supabase.from('banners').insert({
            image_url: url,
            active: true,
            position: 'feed'
        }).select().single();

        if (data) setBanners([data, ...banners]);
    };

    const handleDeleteBanner = async (id: number) => {
        if (!confirm('Supprimer cette bannière ?')) return;
        await supabase.from('banners').delete().eq('id', id);
        setBanners(banners.filter(b => b.id !== id));
    };

    const handleToggleCategory = async (id: number, current: boolean) => {
        await supabase.from('categories').update({ active: !current }).eq('id', id);
        setCategories(categories.map(c => c.id === id ? { ...c, active: !current } : c));
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Supprimer cette catégorie ?')) return;
        await supabase.from('categories').delete().eq('id', id);
        setCategories(categories.filter(c => c.id !== id));
    };

    const handleAddCategory = async () => {
        const name = prompt("Nom de la catégorie :");
        if (!name) return;
        const slug = name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const { data, error } = await supabase.from('categories').insert({
            name,
            slug,
            active: true,
            icon: '📦'
        }).select().single();

        if (error) {
            alert('Erreur: ' + error.message);
            return;
        }
        if (data) setCategories([...categories, data]);
    };

    const handleDeletePost = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cette annonce (irréversible) ?')) return;

        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) {
            alert("Erreur suppression: " + error.message);
        } else {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    // Filtered Posts
    const filteredPosts = posts.filter(p =>
        p.title?.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(postSearch.toLowerCase())
    );

    return (
        <div>
    // --- REPORTS LOGIC ---
            const [reports, setReports] = useState<any[]>([]);

    const fetchReports = async () => {
         const {data} = await supabase.from('reports').select('*, reporter:reporter_id(full_name, phone)').order('created_at', {ascending: false });
            if (data) setReports(data);
    };

    useEffect(() => {
        if (subTab === 'reports') fetchReports();
    }, [subTab]);

    const handleResolveReport = async (id: number) => {
        if (!confirm("Marquer comme traité ?")) return;
            await supabase.from('reports').update({status: 'resolved' }).eq('id', id);
        setReports(reports.map(r => r.id === id ? {...r, status: 'resolved' } : r));
    };

            return (
            <div>
                {/* Sub Nav */}
                <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
                    <button
                        onClick={() => setSubTab('posts')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${subTab === 'posts' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <MessageSquare size={18} className="inline mr-2" /> Annonces ({posts.length})
                    </button>
                    <button
                        onClick={() => setSubTab('banners')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${subTab === 'banners' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <ImageIcon size={18} className="inline mr-2" /> Bannières Pub
                    </button>
                    <button
                        onClick={() => setSubTab('categories')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${subTab === 'categories' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Layers size={18} className="inline mr-2" /> Catégories
                    </button>
                    <button
                        onClick={() => setSubTab('reports')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${subTab === 'reports' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-red-50'}`}
                    >
                        <AlertCircle size={18} className="inline mr-2" /> Signalements
                    </button>
                </div>

                {/* POSTS VIEW */}
                {subTab === 'posts' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <input
                                type="text"
                                placeholder="Rechercher une annonce, un auteur..."
                                className="w-full max-w-sm px-4 py-2 border rounded-lg"
                                value={postSearch}
                                onChange={e => setPostSearch(e.target.value)}
                            />
                            <div className="text-sm text-slate-500">
                                Total: <strong>{posts.length}</strong>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? <p>Chargement...</p> : filteredPosts.map(post => (
                                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800 text-lg">{post.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full font-bold ${post.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 my-2 text-sm">{post.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span>PAR: {post.profiles?.full_name || 'Anonyme'} {post.profiles?.phone && `(${post.profiles.phone})`}</span>
                                            <span>PRIX: {post.price ? post.price + ' FCFA' : 'N/A'}</span>
                                            <span>DATE: {new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 size={18} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BANNERS VIEW */}
                {subTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <h4 className="font-bold mb-4 text-slate-700">Ajouter une nouvelle bannière</h4>
                            <div className="max-w-md">
                                <ImageUpload
                                    label="Image (Paysage)"
                                    bucket="marketing-assets"
                                    onUpload={handleAddBanner}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {banners.map(banner => (
                                <div key={banner.id} className="group relative bg-white rounded-xl overflow-hidden border shadow-sm">
                                    <img src={banner.image_url} alt="Banner" className="w-full h-40 object-cover" />
                                    <div className="p-4 flex justify-between items-center">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {banner.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteBanner(banner.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CATEGORIES VIEW */}
                {subTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Catégories de Services ({categories.length})</h3>
                            <Button size="sm" onClick={handleAddCategory}><Plus size={16} className="mr-2" /> Nouvelle Catégorie</Button>
                        </div>

                        <div className="bg-white rounded-xl border overflow-hidden">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                                            {cat.icon || '📦'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{cat.name}</div>
                                            <div className="text-xs text-slate-500">slug: {cat.slug}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                        <button onClick={() => handleToggleCategory(cat.id, cat.active)} className="text-slate-400 hover:text-emerald-600">
                                            {cat.active ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REPORTS VIEW */}
                {subTab === 'reports' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-red-600">Signalements Utilisateurs</h3>
                        {reports.length === 0 ? <p className="text-slate-500 italic">Aucun signalement.</p> : (
                            <div className="grid gap-4">
                                {reports.map(rep => (
                                    <div key={rep.id} className="bg-red-50 border border-red-100 p-4 rounded-lg flex justify-between items-start">
                                        <div>
                                            <div className="font-bold uppercase text-red-800 text-sm mb-1">{rep.reason}</div>
                                            <p className="text-slate-700 text-sm">{rep.description || 'Aucune description'}</p>
                                            <div className="mt-2 text-xs text-slate-400">
                                                Par: {rep.reporter?.full_name} ({new Date(rep.created_at).toLocaleDateString()})
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {rep.status === 'pending' && (
                                                <Button size="sm" onClick={() => handleResolveReport(rep.id)} className="bg-white text-slate-600 border hover:bg-slate-50">
                                                    Traiter
                                                </Button>
                                            )}
                                            <div className={`px-2 py-1 text-xs font-bold rounded ${rep.status === 'resolved' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                {rep.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            );
}
