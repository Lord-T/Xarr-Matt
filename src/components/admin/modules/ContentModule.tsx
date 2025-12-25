'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, Plus, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function ContentModule() {
    const [subTab, setSubTab] = useState<'banners' | 'categories'>('banners');

    // Data States
    const [banners, setBanners] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const { data: bData } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        // Assume categories table exists or mock it if not
        const { data: cData } = await supabase.from('categories').select('*').order('name');

        if (bData) setBanners(bData);
        if (cData) setCategories(cData);
        setLoading(false);
    };

    // --- Actions ---
    const handleAddBanner = async (url: string) => {
        if (!url) return;
        const { data, error } = await supabase.from('banners').insert({
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
        // Toggle category active state
        await supabase.from('categories').update({ active: !current }).eq('id', id);
        setCategories(categories.map(c => c.id === id ? { ...c, active: !current } : c));
    };

    return (
        <div>
            {/* Sub Nav */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setSubTab('banners')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${subTab === 'banners' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <ImageIcon size={18} className="inline mr-2" /> Bannières Pub
                </button>
                <button
                    onClick={() => setSubTab('categories')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${subTab === 'categories' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Layers size={18} className="inline mr-2" /> Catégories
                </button>
            </div>

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
                        <h3 className="font-bold text-lg">Catégories de Services</h3>
                        <Button size="sm"><Plus size={16} className="mr-2" /> Nouvelle Catégorie</Button>
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
                                <button onClick={() => handleToggleCategory(cat.id, cat.active)} className="text-slate-400 hover:text-emerald-600">
                                    {cat.active ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
