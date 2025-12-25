'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, History, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { supabase } from '@/lib/supabase';

export default function WalletPage() {
    const router = useRouter();
    const [balance, setBalance] = useState(0); // Default to 0 as per requirements
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data for Chart
    const dailyGains = [
        { day: 'Lun', amount: 15000 },
        { day: 'Mar', amount: 8000 },
        { day: 'Mer', amount: 22000 },
        { day: 'Jeu', amount: 12000 },
        { day: 'Ven', amount: 5000 },
        { day: 'Sam', amount: 30000 },
        { day: 'Dim', amount: 0 },
    ];
    const maxGain = Math.max(...dailyGains.map(d => d.amount));

    // Transaction History Logic
    const [history, setHistory] = useState<any[]>([]);

    const fetchHistory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
            if (data) setHistory(data.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                label: t.label || 'Transaction',
                date: new Date(t.created_at).toLocaleDateString() + ' ' + new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        }
    };

    // Fetch on mount
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
                if (data) setBalance(data.balance || 0);
                fetchHistory();
            }
        };
        init();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mon Portefeuille</h1>
            </div>

            <div style={{ padding: '1rem', flex: 1 }}>

                {/* Balance Card */}
                <div style={{ backgroundColor: '#1E293B', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Solde disponible (Commission)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }}>
                            {balance.toLocaleString()} <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>FCFA</span>
                        </div>
                        {balance < 700 && (
                            <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                                ⚠️ Solde insuffisant pour accepter des missions !
                            </div>
                        )}
                    </div>
                    <Wallet size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => setIsModalOpen(true)} style={{ padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
                        <ArrowUpRight size={20} /> Recharger
                    </button>
                    <button style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <TrendingUp size={20} /> Bilan
                    </button>
                </div>

                {/* Chart Section */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', color: '#334155' }}>Gains de la semaine</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px' }}>
                        {dailyGains.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                <div style={{
                                    width: '8px',
                                    height: `${(d.amount / maxGain) * 100}%`,
                                    backgroundColor: d.amount > 0 ? '#10B981' : '#E2E8F0',
                                    borderRadius: '4px',
                                    transition: 'height 0.5s ease'
                                }}></div>
                                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#334155' }}>Historique récent</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.map(tx => (
                        <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: tx.type === 'deposit' ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {tx.type === 'deposit' ? <ArrowDownLeft size={20} color="#10B981" /> : <ArrowUpRight size={20} color="#EF4444" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#1E293B', fontSize: '0.9rem' }}>{tx.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{tx.date}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 600, color: tx.type === 'deposit' ? '#10B981' : '#EF4444' }}>
                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPaymentComplete={async (paidAmount: number) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // 1. Update Profile Balance
                    const { error: profileError } = await supabase.rpc('increment_balance', {
                        user_id_param: user.id,
                        amount_param: paidAmount
                    });

                    // Fallback if RPC not exists (though concurrent unsafe, ok for now)
                    if (profileError) {
                        console.warn("RPC failed, using direct update", profileError);
                        const { data: currentProfile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
                        const newBalance = (currentProfile?.balance || 0) + paidAmount;
                        await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
                    }

                    // 2. Add Transaction
                    await supabase.from('transactions').insert({
                        user_id: user.id,
                        amount: paidAmount,
                        type: 'deposit',
                        label: 'Rechargement Mobile Money'
                    });

                    setBalance(prev => prev + paidAmount);
                    fetchHistory(); // Refresh history
                    setIsModalOpen(false);
                    alert(`Compte rechargé de ${paidAmount} FCFA avec succès !`);
                }}
            />

            <BottomNav />
        </div>
    );
}
