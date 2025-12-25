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

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

    const openCreditModal = (user: any) => {
        setSelectedUser(user);
        setCreditAmount('');
        setIsCreditModalOpen(true);
    };

    const handleConfirmCredit = async () => {
        if (!selectedUser || !creditAmount) return;
        const amount = parseInt(creditAmount);
        if (isNaN(amount) || amount <= 0) return alert("Montant invalide");

        if (!confirm(`Confirmer l'ajout de ${amount} FCFA au solde de ${selectedUser.full_name} ?`)) return;

        // 1. Update Profile Balance
        const newBalance = (selectedUser.balance || 0) + amount;
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', selectedUser.id);

        if (profileError) {
            alert("Erreur mise à jour profil: " + profileError.message);
            return;
        }

        // 2. Log Transaction
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: selectedUser.id,
            amount: amount,
            type: 'deposit',
            label: 'Cadeau Admin 🎁'
        });

        if (txError) console.error("Erreur log transaction", txError);

        // 3. UI Update
        alert("Succès ! Montant crédité.");
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, balance: newBalance } : u));
        setIsCreditModalOpen(false);
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
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <CheckCircle size={14} /> Actif
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openCreditModal(user)}
                                            className="px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                                            title="Offrir de l'argent"
                                        >
                                            <Coins size={16} /> Offrir
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

            {/* Credit Modal */}
            {isCreditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl scale-100">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Coins className="text-yellow-500" /> Offrir du Crédit
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Vous allez ajouter des fonds au portefeuille de <strong>{selectedUser?.full_name}</strong>.
                            Cette action est immédiate.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Montant à offrir (FCFA)</label>
                            <input
                                type="number"
                                className="w-full text-2xl font-mono p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                autoFocus
                                placeholder="ex: 5000"
                                value={creditAmount}
                                onChange={e => setCreditAmount(e.target.value)}
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
                                Confirmer l'envoi 💸
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
