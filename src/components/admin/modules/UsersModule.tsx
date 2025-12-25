'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MoreVertical, Shield, Ban, Coins, CheckCircle, XCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload'; // Reusing for consistency if needed

export function UsersModule() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, provider, client, banned

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        setLoading(false);
    };

    const handleBan = async (id: string, currentStatus: boolean) => {
        // Mock ban logic (needs 'banned' column in profiles, adding it conceptually)
        // For now, we'll just toggle a metadata field or simulate
        alert(`Ban/Unban logic for ${id}`);
    };

    const handleVerify = async (id: string) => {
        // Logic to approve verification
        alert(`Verification logic for ${id}`);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        // Filter logic mock
        return matchesSearch;
    });

    return (
        <div>
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, téléphone..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 border rounded-lg bg-white" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">Tous les utilisateurs</option>
                        <option value="provider">Prestataires</option>
                        <option value="client">Clients</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-500 border-b border-slate-200">
                            <th className="py-3 px-4 font-medium">Utilisateur</th>
                            <th className="py-3 px-4 font-medium">Rôle</th>
                            <th className="py-3 px-4 font-medium">Solde</th>
                            <th className="py-3 px-4 font-medium">Statut</th>
                            <th className="py-3 px-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10">Chargement...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                                {user.full_name?.[0] || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{user.full_name || 'Sans Nom'}</div>
                                        <div className="text-xs text-slate-500">{user.phone}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {user.is_provider ? (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Prestataire</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Client</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 font-mono font-medium">
                                    {user.balance?.toLocaleString()} FCFA
                                </td>
                                <td className="py-3 px-4">
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <CheckCircle size={14} /> Actif
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500" title="Ajuster Solde">
                                            <Coins size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-100 rounded-lg text-red-500" title="Bannir">
                                            <Ban size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
