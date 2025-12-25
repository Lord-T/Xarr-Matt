'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, DollarSign, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinancesModule() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVolume: 0, totalCommission: 0 });
    const [commissionRate, setCommissionRate] = useState(10); // Default 10%

    useEffect(() => {
        fetchFinances();
    }, []);

    const fetchFinances = async () => {
        setLoading(true);
        // 1. Fetch Transactions
        const { data: transData } = await supabase
            .from('transactions')
            .select('*, profiles:user_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (transData) setTransactions(transData);

        // 2. Mock Stats Calculation (Real impl would use RPC or aggregation query)
        // For now, simple client-side sum of loaded data
        const volume = transData?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;
        const commission = Math.floor(volume * 0.1); // Mock 10% of volume
        setStats({ totalVolume: volume, totalCommission: commission });

        setLoading(false);
    };

    const handleSaveRate = () => {
        // Save to app_settings
        alert(`Nouveau taux de commission : ${commissionRate}% (Simulation)`);
    };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm mb-1">Volume Total</div>
                    <div className="text-2xl font-bold text-slate-800">{stats.totalVolume.toLocaleString()} FCFA</div>
                    <div className="flex items-center text-green-500 text-xs font-bold mt-2">
                        <TrendingUp size={14} className="mr-1" /> +12%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm mb-1">Commissions (Est.)</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalCommission.toLocaleString()} FCFA</div>
                    <div className="text-xs text-slate-400 mt-2">Revenu Net</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white">
                    <div className="text-slate-400 text-sm mb-1">Taux actuel</div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="text-2xl font-bold bg-transparent border-b border-slate-600 w-20 focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-2xl font-bold">%</span>
                    </div>
                    <Button onClick={handleSaveRate} size="sm" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
                        Mettre à jour
                    </Button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 font-bold text-slate-700">
                    Historique des Transactions
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                        <tr>
                            <th className="p-4">Utilisateur</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Montant</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement...</td></tr>
                        ) : transactions.map(t => (
                            <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50">
                                <td className="p-4 font-medium">{t.profiles?.full_name || 'Inconnu'}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 ${t.type === 'deposit' ? 'text-green-600' :
                                            t.type === 'withdrawal' ? 'text-red-500' : 'text-blue-500'
                                        }`}>
                                        {t.type === 'deposit' && <ArrowDownLeft size={16} />}
                                        {t.type === 'withdrawal' && <ArrowUpRight size={16} />}
                                        {t.type === 'commission' && <DollarSign size={16} />}
                                        <span className="capitalize">{t.type}</span>
                                    </span>
                                </td>
                                <td className="p-4 font-bold">{t.amount} F</td>
                                <td className="p-4 text-slate-400">
                                    {new Date(t.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
