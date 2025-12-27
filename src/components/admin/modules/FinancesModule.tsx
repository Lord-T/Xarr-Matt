'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, DollarSign, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinancesModule() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVolume: 0, totalCommission: 0, pendingAmount: 0 });
    const [commissionRate, setCommissionRate] = useState(10);
    const [activeTab, setActiveTab] = useState<'history' | 'withdrawals'>('withdrawals');

    useEffect(() => {
        fetchFinances();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('app_settings').select('value').eq('key', 'commission_config').single();
        if (data?.value?.rate) setCommissionRate(data.value.rate);
    };

    const fetchFinances = async () => {
        setLoading(true);

        // 1. Fetch History (Completed/Rejected/Deposits)
        const { data: historyData } = await supabase
            .from('payment_transactions')
            .select('*, profiles:user_id(full_name)')
            .neq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(50);

        if (historyData) setTransactions(historyData);

        // 2. Fetch Pending Withdrawals
        const { data: pendingData } = await supabase
            .from('payment_transactions')
            .select('*, profiles:user_id(full_name, phone_number)')
            .eq('type', 'withdrawal')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (pendingData) setPendingWithdrawals(pendingData);

        // 3. Stats
        let totalComm = 0;
        let totalVol = 0;

        // Commissions
        const { data: allComms } = await supabase.from('payment_transactions').select('amount').eq('type', 'commission');
        if (allComms) totalComm = allComms.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        // System Volume (Total Balances)
        const { data: allProfiles } = await supabase.from('profiles').select('balance');
        if (allProfiles) totalVol = allProfiles.reduce((acc, p) => acc + (p.balance || 0), 0);

        // Pending Amount
        const pendingAmt = pendingData ? pendingData.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) : 0;

        setStats({ totalVolume: totalVol, totalCommission: totalComm, pendingAmount: pendingAmt });
        setLoading(false);
    };

    const handleApprove = async (txId: string) => {
        if (!confirm("Confirmer le transfert d'argent ?")) return;

        const { data, error } = await supabase.rpc('admin_approve_withdrawal', { p_transaction_id: txId });

        if (error) return alert("Erreur: " + error.message);
        // @ts-ignore
        if (data && !data.success) return alert("Erreur: " + data.message);

        alert("✅ Retrait validé !");
        fetchFinances();
    };

    const handleReject = async (txId: string) => {
        const reason = prompt("Raison du rejet ?");
        if (!reason) return;

        const { data, error } = await supabase.rpc('admin_reject_withdrawal', {
            p_transaction_id: txId,
            p_reason: reason
        });

        if (error) return alert("Erreur: " + error.message);
        // @ts-ignore
        if (data && !data.success) return alert("Erreur: " + data.message);

        alert("❌ Retrait rejeté et remboursé.");
        fetchFinances();
    };

    const handleSaveRate = async () => {
        const { error } = await supabase.from('app_settings').upsert({
            key: 'commission_config',
            value: { rate: commissionRate, fixed_fallback: 500 },
            updated_at: new Date().toISOString()
        });
        if (error) alert("Erreur sauvegarde : " + error.message);
        else alert(`✅ Taux de commission mis à jour à ${commissionRate}% !`);
    };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm mb-1">Fonds Utilisateurs (Volume)</div>
                    <div className="text-2xl font-bold text-slate-800">{stats.totalVolume.toLocaleString()} FCFA</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="text-slate-500 text-sm mb-1">Commissions Totales</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalCommission.toLocaleString()} FCFA</div>
                    <DollarSign className="absolute right-4 bottom-4 text-emerald-100" size={48} />
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white">
                    <div className="text-blue-200 text-sm mb-1">En attente de retrait</div>
                    <div className="text-2xl font-bold text-white">{stats.pendingAmount.toLocaleString()} FCFA</div>
                    <div className="text-xs text-slate-400 mt-2">{pendingWithdrawals.length} demandes</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-4">
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`pb-2 px-4 font-medium ${activeTab === 'withdrawals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    Retraits en attente ({pendingWithdrawals.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-4 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    Historique Transactions
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                        <tr>
                            <th className="p-4">Utilisateur</th>
                            <th className="p-4">Montant</th>
                            <th className="p-4">Détails</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">Chargement...</td></tr>
                        ) : activeTab === 'withdrawals' ? (
                            transactions.length === 0 && pendingWithdrawals.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Aucune demande en attente.</td></tr>
                            ) : pendingWithdrawals.map(t => (
                                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-medium">
                                        <div>{t.profiles?.full_name || 'Inconnu'}</div>
                                        <div className="text-xs text-slate-400">ID: ...{t.user_id.slice(-4)}</div>
                                    </td>
                                    <td className="p-4 font-bold text-lg">{t.amount.toLocaleString()} F</td>
                                    <td className="p-4 text-xs">
                                        <div className="font-semibold uppercase text-slate-600">{t.provider}</div>
                                        <div className="text-blue-600">{t.phone_number || t.profiles?.phone_number}</div>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs">
                                        {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" onClick={() => handleApprove(t.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs">
                                                Valider
                                            </Button>
                                            <Button size="sm" onClick={() => handleReject(t.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs">
                                                Rejeter
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            transactions.map(t => (
                                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 opacity-80">
                                    <td className="p-4 font-medium">{t.profiles?.full_name || 'Inconnu'}</td>
                                    <td className="p-4 font-bold">{t.amount.toLocaleString()} F</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${t.type === 'commission' ? 'bg-blue-100 text-blue-700' :
                                                t.type === 'deposit' ? 'bg-green-100 text-green-700' :
                                                    t.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {t.type} {t.status === 'rejected' && '(Rejeté)'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs">
                                        {new Date(t.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-xs text-slate-400 capitalize">{t.status}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Rate Config */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mt-6 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-700">Configuration des Commissions</h3>
                    <p className="text-sm text-slate-500">Ce taux s'applique à toutes les nouvelles missions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="bg-slate-100 border border-slate-300 rounded px-3 py-2 w-20 font-bold text-center"
                    />
                    <span className="font-bold text-slate-600">%</span>
                    <Button onClick={handleSaveRate} size="sm">Mettre à jour</Button>
                </div>
            </div>
        </div>
    );
}
