'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayCircle, Palette, AlertTriangle, Save, Smartphone, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useTheme } from '@/context/ThemeContext';

export function SystemModule() {
    const { setPrimaryColor } = useTheme();

    // Config States
    const [splashAd, setSplashAd] = useState({ active: true, url: '', link: '' });
    const [themeColor, setThemeColor] = useState('#10B981');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Mock Load (Replace with app_settings fetch)
    useEffect(() => {
        // Load settings from DB later
    }, []);

    const handleSaveSplash = () => {
        // Save to DB (app_settings)
        console.log("Saving Splash:", splashAd);
        // localStorage for fallback persistence in this demo
        localStorage.setItem('splash_config', JSON.stringify(splashAd));
        alert("Configuration Splash Screen sauvegardée !");
    };

    const handleThemeChange = (color: string) => {
        setThemeColor(color);
        setPrimaryColor(color);
        // Persist
        localStorage.setItem('theme_color', color);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Splash Screen Section */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Splash Screen (Publicité Démarrage)</h3>
                        <p className="text-sm text-slate-500">S'affiche en plein écran à l'ouverture de l'application.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium mb-2">Image de couverture (Portrait)</label>
                        <ImageUpload
                            bucket="marketing-assets"
                            label="Glisser ou cliquer"
                            currentImage={splashAd.url}
                            onUpload={(url) => setSplashAd({ ...splashAd, url })}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Lien de redirection (Optionnel)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="https://..."
                                value={splashAd.link}
                                onChange={e => setSplashAd({ ...splashAd, link: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
                            <input
                                type="checkbox"
                                id="splashActive"
                                className="w-5 h-5 text-emerald-600 rounded"
                                checked={splashAd.active}
                                onChange={e => setSplashAd({ ...splashAd, active: e.target.checked })}
                            />
                            <label htmlFor="splashActive" className="font-medium">Activer la publicité</label>
                        </div>
                        <Button className="w-full" onClick={handleSaveSplash}>
                            <Save size={18} className="mr-2" /> Enregistrer Splash
                        </Button>
                    </div>
                </div>
            </div>


            {/* ADMIN MANAGEMENT */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Gestion de l'Équipe Admin</h3>
                        <p className="text-sm text-slate-500">Ajoutez des collaborateurs pour vous aider.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Add Form */}
                    <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Email de l'utilisateur</label>
                            <input
                                type="email"
                                placeholder="exemple@gmail.com"
                                className="w-full px-4 py-2 border rounded-lg"
                                id="newAdminEmail"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Rôle</label>
                            <select id="newAdminRole" className="w-full px-4 py-2 border rounded-lg bg-white">
                                <option value="moderator">Modérateur</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <Button onClick={async () => {
                            const emailInput = document.getElementById('newAdminEmail') as HTMLInputElement;
                            const roleInput = document.getElementById('newAdminRole') as HTMLSelectElement;
                            const email = emailInput.value;
                            const role = roleInput.value;

                            if (!email) return alert("Email requis");

                            // 1. Get ID
                            const { data: uid, error: uidError } = await supabase.rpc('get_user_id_by_email', { user_email: email });

                            if (uidError || !uid) {
                                alert("Utilisateur introuvable. Il doit d'abord s'inscrire sur l'app.");
                                return;
                            }

                            // 2. Insert Role
                            const { error: roleError } = await supabase.from('admin_roles').insert({
                                user_id: uid,
                                role: role
                            });

                            if (roleError) {
                                alert("Erreur ajout: " + roleError.message);
                            } else {
                                alert("Admin ajouté avec succès !");
                                emailInput.value = '';
                                // Reload list logic here if implemented
                            }
                        }}>
                            <Plus size={18} className="mr-2" /> Ajouter
                        </Button>
                    </div>

                    {/* Admin List (Hard to fetch fully without joining profiles, keeping simple for now) */}
                    <div className="bg-slate-50 p-4 rounded-lg text-center text-slate-500 text-sm">
                        <em>La liste des administrateurs sera visible ici.</em>
                        {/* 
                            To implement list: 
                            Need supabase.from('admin_roles').select('*, profiles(*)') 
                            Profiles relation must be set up in DB. 
                        */}
                    </div>
                </div>
            </div>

            {/* Theme & Maintenance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Theme Config */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="text-purple-600" />
                        <h3 className="font-bold text-slate-800">Thème Visuel</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Couleur principale de l'application</p>

                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            className="w-16 h-16 rounded cursor-pointer border-0"
                            value={themeColor}
                            onChange={(e) => handleThemeChange(e.target.value)}
                        />
                        <div className="text-sm font-mono bg-white px-3 py-1 border rounded">{themeColor}</div>
                    </div>
                </div>

                {/* System Danger Zone */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-600" />
                        <h3 className="font-bold text-red-800">Zone de Danger</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100">
                        <div>
                            <div className="font-bold text-slate-800">Mode Maintenance</div>
                            <div className="text-xs text-slate-500">Ferme le site public</div>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="toggle"
                                id="toggle"
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                checked={maintenanceMode}
                                onChange={() => setMaintenanceMode(!maintenanceMode)}
                            />
                            <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
