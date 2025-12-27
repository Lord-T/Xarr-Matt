'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MoreVertical, Shield, Ban, Coins, CheckCircle, XCircle, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

    // Realtime Listener
    useEffect(() => {
        const channel = supabase
            .channel('admin_users_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u));
                    }
                    if (payload.eventType === 'INSERT') {
                        setUsers(prev => [payload.new, ...prev]);
                    }
                })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleBan = async (user: any) => {
        const newStatus = !user.is_banned;
        if (!confirm(newStatus ? `Bannir ${user.full_name} ?` : `Débannir ${user.full_name} ?`)) return;

        const { data, error } = await supabase.rpc('admin_toggle_ban', {
            p_user_id: user.id,
            p_status: newStatus
        });

        if (error) return alert("Erreur: " + error.message);
        // @ts-ignore
        if (data && !data.success) return alert("Erreur: " + data.message);

        alert(newStatus ? "Utilisateur banni." : "Utilisateur débanni.");
        // UI updates automatically via Realtime usually, but let's be safe
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: newStatus } : u));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone || '').includes(searchTerm);

        let matchesFilter = true;
        if (filter === 'provider') matchesFilter = user.is_provider;
        if (filter === 'client') matchesFilter = !user.is_provider;
        if (filter === 'banned') matchesFilter = user.is_banned;

        return matchesSearch && matchesFilter;
    });

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [reason, setReason] = useState('Cadeau Admin 🎁');
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

    const openCreditModal = (user: any) => {
        setSelectedUser(user);
        setCreditAmount('');
        setIsCreditModalOpen(true);
    };

    const handleConfirmCredit = async () => {
        if (!selectedUser || !creditAmount) return;
        const amount = parseInt(creditAmount);
        if (isNaN(amount) || amount === 0) return alert("Montant invalide");

        if (!confirm(`Confirmer l'ajustement de ${amount} FCFA pour ${selectedUser.full_name} ?`)) return;

        // Use RPC
        const { data, error } = await supabase.rpc('admin_adjust_balance', {
            p_user_id: selectedUser.id,
            p_amount: amount,
            p_reason: reason
        });

        if (error) return alert("Erreur: " + error.message);
        // @ts-ignore
        if (data && !data.success) return alert("Erreur: " + data.message);

        alert("Succès ! Solde ajusté.");
        setIsCreditModalOpen(false);
        // Balance updates via Realtime
    };

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
                        <option value="banned">Bannis</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto min-h-[400px]">
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
                                <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                                    {user.balance?.toLocaleString()} FCFA
                                </td>
                                <td className="py-3 px-4">
                                    {user.is_banned ? (
                                        <span className="flex items-center gap-1 text-red-600 text-sm font-bold bg-red-100 px-2 py-1 rounded-full w-fit">
                                            <Ban size={14} /> Banni
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <CheckCircle size={14} /> Actif
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openCreditModal(user)}
                                            className="px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                                            title="Ajuster Solde"
                                        >
                                            <Coins size={16} /> Solde
                                        </button>
                                        <button
                                            onClick={() => handleBan(user)}
                                            className={`p-2 rounded-lg ${user.is_banned ? 'bg-orange-100 text-orange-600' : 'hover:bg-red-100 text-red-500'}`}
                                            title={user.is_banned ? "Débannir" : "Bannir"}
                                        >
                                            {user.is_banned ? <Unlock size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Credit Modal */}
            {isCreditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl scale-100">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Coins className="text-yellow-500" /> Ajuster le Solde
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Modifier le solde de <strong>{selectedUser?.full_name}</strong>.
                            Utilisez un montant négatif pour une pénalité.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Montant (FCFA)</label>
                            <input
                                type="number"
                                className="w-full text-2xl font-mono p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                autoFocus
                                placeholder="ex: 5000 ou -2000"
                                value={creditAmount}
                                onChange={e => setCreditAmount(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Raison / Label</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Raison de l'ajustement"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreditModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmCredit}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md transform active:scale-95 transition-all"
                            >
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
