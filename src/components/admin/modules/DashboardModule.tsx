'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CreditCard, Layout, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { AdminTab } from '@/components/admin/AdminSidebar';

export function DashboardModule({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) { // Using simple prop for nav
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePosts: 0,
        totalRevenue: 0,
        pendingVerif: 0
    });

    useEffect(() => {
        const fetchGlobalStats = async () => {
            // Parallel Fetching for speed
            const [
                { count: users },
                { count: posts },
                { data: transactions },
                { count: verif }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('*', { count: 'exact', head: true }),
                supabase.from('transactions').select('amount').eq('type', 'commission'),
                supabase.from('verification_docs').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            const revenue = transactions?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

            setStats({
                totalUsers: users || 0,
                activePosts: posts || 0,
                totalRevenue: revenue,
                pendingVerif: verif || 0
            });
        };
        fetchGlobalStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Utilisateurs"
                    value={stats.totalUsers}
                    icon={<Users className="text-blue-500" />}
                    trend="+5%"
                />
                <StatCard
                    label="Annonces Actives"
                    value={stats.activePosts}
                    icon={<Layout className="text-purple-500" />}
                />
                <StatCard
                    label="Revenus Com."
                    value={`${stats.totalRevenue.toLocaleString()} F`}
                    icon={<CreditCard className="text-emerald-500" />}
                    trend="+12%"
                />
                <StatCard
                    label="Vérifications"
                    value={stats.pendingVerif}
                    icon={<Users className="text-orange-500" />}
                    alert={stats.pendingVerif > 0}
                />
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Actions Rapides</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onNavigate('users')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors">
                            <div className="font-bold text-slate-700">Gestion Utilisateurs</div>
                            <div className="text-xs text-slate-500 mt-1">Bannir, Modifier, Solde</div>
                        </button>
                        <button onClick={() => onNavigate('content')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors">
                            <div className="font-bold text-slate-700">Nouvelle Pub</div>
                            <div className="text-xs text-slate-500 mt-1">Ajouter une bannière</div>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">État du Système</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-slate-300">Statut Serveur</span>
                            <span className="flex items-center text-emerald-400 font-bold gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Online</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-slate-300">Base de Données</span>
                            <span className="text-emerald-400 font-bold">Connecté</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Version</span>
                            <span className="text-slate-400 font-mono">v1.2.0-beta</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon, trend, alert }: any) => (
    <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between ${alert ? 'border-orange-200 bg-orange-50' : ''}`}>
        <div>
            <div className="text-slate-500 text-sm font-medium">{label}</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
            {trend && <div className="text-xs font-bold text-emerald-600 mt-2 flex items-center"><ArrowUpRight size={12} className="mr-1" /> {trend}</div>}
        </div>
        <div className={`p-3 rounded-lg ${alert ? 'bg-orange-100' : 'bg-slate-50'}`}>{icon}</div>
    </div>
);
