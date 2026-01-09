'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Camera, Image as ImageIcon, Save, Loader, FileText, Plus, X, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfileEditPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        profession: '', // New field
        phone: '',
        location: '',
        bio: '',
        avatar_url: '',
        specialties: [] as string[],
        years_experience: 0
    });

    const [newSpecialty, setNewSpecialty] = useState('');

    // Documents State
    const [documents, setDocuments] = useState<any[]>([]);

    // Businesses State
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [newBusiness, setNewBusiness] = useState({ name: '', description: '', category: 'Commerce' });


    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    full_name: profile.full_name || '',
                    profession: profile.profession || '', // Load it
                    phone: profile.phone || '',
                    location: '',
                    bio: profile.bio || '',
                    avatar_url: profile.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg',
                    specialties: profile.specialties || [],
                    years_experience: profile.years_experience || 0
                });
            }

            // 2. Fetch Documents (safely)
            try {
                const { data: docs } = await supabase.from('profile_documents').select('*').eq('user_id', user.id);
                if (docs) setDocuments(docs);
            } catch (e) {
                console.warn("Docs table issue", e);
            }

            // 3. Fetch Businesses (safely)
            try {
                const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id);
                if (biz) setBusinesses(biz);
            } catch (e) {
                console.warn("Biz table issue", e);
            }

            setLoading(false);
        };
        fetchProfile();
    }, []);


    // --- HANDLERS ---

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const filePath = `avatars/${Date.now()}_${file.name}`;
        await supabase.storage.from('avatars').upload(filePath, file);
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
        setUploading(false);
    };

    const handleAddSpecialty = () => {
        if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
            setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }));
            setNewSpecialty('');
        }
    };

    const removeSpecialty = (spec: string) => {
        setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== spec) }));
    };

    const handleDocumentUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const filePath = `${user.id}/${Date.now()}_${type}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('sensitive-documents').upload(filePath, file);

            // Note: If 'sensitive-documents' bucket doesn't exist, this will fail. 
            // In a real scenario we'd create it, but I assume the schema script ran.
            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage.from('sensitive-documents').getPublicUrl(filePath);

            const { data: newDoc, error: dbError } = await supabase.from('profile_documents').insert({
                user_id: user.id,
                document_type: type,
                file_url: publicData.publicUrl,
                status: 'pending'
            }).select().single();

            if (newDoc) setDocuments(prev => [...prev, newDoc]);
            alert("Document envoyé pour vérification !");
        } catch (err: any) {
            console.error(err);
            alert("Erreur upload: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateBusiness = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('businesses').insert({
            owner_id: user.id,
            name: newBusiness.name,
            description: newBusiness.description,
            category: newBusiness.category
        }).select().single();

        if (data) {
            setBusinesses(prev => [...prev, data]);
            setIsBusinessModalOpen(false);
            setNewBusiness({ name: '', description: '', category: 'Commerce' });
            alert("Business créé !");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                profession: formData.profession, // Add profession
                bio: formData.bio,
                specialties: formData.specialties,
                years_experience: formData.years_experience,
                avatar_url: formData.avatar_url
            })
            .eq('id', user?.id);

        setSaving(false);
        if (!error) {
            alert("Profil mis à jour !");
            router.push('/profile'); // Redirect to profile view
        } else {
            alert("Erreur sauvegarde : " + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color="#0F172A" />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Éditer Mega-Profil</h1>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* 1. Identity & Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundImage: `url("${formData.avatar_url}")`, backgroundSize: 'cover', position: 'relative', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition">
                            <Camera size={16} />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                </div>

                {/* 2. Basic Info */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Nom Complet</label>
                        <input type="text" className="input w-full" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>

                    {/* Profession Input (Smart Suggestion) */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Métier Principal</label>
                        <input
                            list="professions-list"
                            type="text"
                            className="input w-full font-semibold text-blue-900 bg-blue-50/50 border-blue-200 focus:border-blue-500"
                            placeholder="Ex: Maçon, Informaticien..."
                            value={formData.profession}
                            onChange={e => setFormData({ ...formData, profession: e.target.value })}
                        />
                        <datalist id="professions-list">
                            {/* BTP & Construction */}
                            <option value="Maçon" />
                            <option value="Menuisier" />
                            <option value="Plombier" />
                            <option value="Électricien" />
                            <option value="Peintre" />
                            <option value="Carreleur" />
                            <option value="Soudeur" />
                            <option value="Vitrier" />
                            <option value="Charpentier" />
                            <option value="Ferronnier" />

                            {/* Transport & Logistique */}
                            <option value="Chauffeur" />
                            <option value="Taximan" />
                            <option value="Livreur" />
                            <option value="Moto-Taxi (Tiak-Tiak)" />
                            <option value="Charretier" />
                            <option value="Déménageur" />

                            {/* Maison & Services */}
                            <option value="Femme de ménage" />
                            <option value="Cuisinier" />
                            <option value="Traiteur" />
                            <option value="Jardinier" />
                            <option value="Gardien" />
                            <option value="Blanchisseur" />
                            <option value="Nounou" />

                            {/* Technique & Réparation */}
                            <option value="Mécanicien" />
                            <option value="Frigoriste" />
                            <option value="Réparateur Téléphone" />
                            <option value="Réparateur TV/Électroménager" />
                            <option value="Informaticien" />

                            {/* Beauté & Mode */}
                            <option value="Couturier / Tailleur" />
                            <option value="Coiffeur" />
                            <option value="Tresseuse" />
                            <option value="Maquilleuse" />

                            {/* Autres */}
                            <option value="Commerçant" />
                            <option value="Boutiquier" />
                            <option value="Enseignant / Répétiteur" />
                            <option value="Photographe" />
                            <option value="Infirmier" />
                            <option value="Agent Immobilier" />
                            <option value="Bricoleur" />
                            <option value="Comptable" />
                            <option value="Sécurité" />
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Biographie</label>
                        <textarea className="input w-full" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Dites-en plus sur vous..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Années d'expérience</label>
                        <input type="number" className="input w-full" value={formData.years_experience} onChange={e => setFormData({ ...formData, years_experience: parseInt(e.target.value) })} />
                    </div>
                </div>

                {/* 3. Specialties (Tags) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-semibold mb-2">Spécialités / Métiers</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {formData.specialties.map(spec => (
                            <span key={spec} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                {spec}
                                <button type="button" onClick={() => removeSpecialty(spec)}><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Ajouter (ex: Plombier)"
                            value={newSpecialty}
                            onChange={e => setNewSpecialty(e.target.value)}
                        />
                        <button type="button" className="btn btn-secondary" onClick={handleAddSpecialty}>+</button>
                    </div>
                </div>

                {/* 4. Documents (Verification) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={18} /> Documents Vérification</h3>

                    <div className="space-y-3">
                        <DocumentStatusRow type="id_card" label="Carte d'Identité (Recto/Verso)" documents={documents} onUpload={(e) => handleDocumentUpload('id_card', e)} />
                        <DocumentStatusRow type="cv" label="Curriculum Vitae (CV)" documents={documents} onUpload={(e) => handleDocumentUpload('cv', e)} />
                        <DocumentStatusRow type="diploma" label="Diplômes / Certifications" documents={documents} onUpload={(e) => handleDocumentUpload('diploma', e)} />
                    </div>
                </div>

                {/* 5. Business Space */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold flex items-center gap-2"><Store size={18} /> Espace Business</h3>
                        <button type="button" onClick={() => setIsBusinessModalOpen(true)} className="text-blue-600 text-sm font-bold flex items-center gap-1">
                            <Plus size={16} /> Créer
                        </button>
                    </div>

                    {businesses.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Aucun business créé.</p>
                    ) : (
                        <div className="grid gap-2">
                            {businesses.map(biz => (
                                <div key={biz.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                        {biz.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{biz.name}</div>
                                        <div className="text-xs text-slate-500">{biz.category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button fullWidth size="lg" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Sauvegarder Tout'} <Save size={18} className="ml-2" />
                </Button>

            </form>

            {/* Business Modal (Simple Overlay) */}
            {isBusinessModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Nouveau Business</h3>
                        <div className="space-y-3">
                            <input className="input w-full" placeholder="Nom de l'enseigne" value={newBusiness.name} onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })} />
                            <input className="input w-full" placeholder="Description courte" value={newBusiness.description} onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })} />
                            <select className="input w-full" value={newBusiness.category} onChange={e => setNewBusiness({ ...newBusiness, category: e.target.value })}>
                                <option>Commerce</option>
                                <option>Service</option>
                                <option>Restautation</option>
                                <option>Agence</option>
                            </select>
                            <div className="flex gap-2 mt-4">
                                <Button fullWidth variant="outline" onClick={() => setIsBusinessModalOpen(false)}>Annuler</Button>
                                <Button fullWidth onClick={handleCreateBusiness}>Créer</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for Docs
function DocumentStatusRow({ type, label, documents, onUpload }: { type: string, label: string, documents: any[], onUpload: (e: any) => void }) {
    const doc = documents.find(d => d.document_type === type);

    return (
        <div className="flex items-center justify-between p-2 border-b border-slate-100 last:border-0">
            <div>
                <div className="text-sm font-medium">{label}</div>
                {doc ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.status === 'verified' ? 'Vérifié ✅' : 'En attente ⏳'}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">Non fourni</span>
                )}
            </div>
            {!doc && (
                <label className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer hover:bg-slate-200">
                    Uploader
                    <input type="file" hidden onChange={onUpload} accept="application/pdf,image/*" />
                </label>
            )}
        </div>
    );
}
