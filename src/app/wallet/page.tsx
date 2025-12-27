'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, History, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { supabase } from '@/lib/supabase';

export default function WalletPage() {
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'deposit' | 'withdrawal'>('deposit');
    const [history, setHistory] = useState<any[]>([]);

    // Fetch on mount
    const refreshData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 1. Balance
            const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
            if (data) setBalance(data.balance || 0);

            // 2. History
            const { data: txs } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (txs) {
                setHistory(txs.map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    status: t.status,
                    label: t.type === 'deposit' ? 'Rechargement' : (t.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
                    date: new Date(t.created_at).toLocaleDateString() + ' ' + new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })));
            }
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const openDeposit = () => {
        setModalMode('deposit');
        setIsModalOpen(true);
    };

    const openWithdrawal = () => {
        setModalMode('withdrawal');
        setIsModalOpen(true);
    };

    const handleTransactionComplete = async (amount: number, method: string, phoneNumber: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (modalMode === 'deposit') {
            // Call Simulation RPC
            const { error: rpcError } = await supabase.rpc('simulate_deposit', {
                p_amount: amount,
                p_provider: method
            });

            if (rpcError) {
                alert("Erreur lors du rechargement : " + rpcError.message);
            } else {
                alert(`Compte rechargé de ${amount} FCFA avec succès !`);
                refreshData();
            }
        }
        else if (modalMode === 'withdrawal') {
            // Call Withdrawal RPC (Checks 700 FCFA rule)
            const { data: result, error: rpcError } = await supabase.rpc('request_withdrawal', {
                p_amount: amount,
                p_provider: method,
                p_phone: phoneNumber
            });

            if (rpcError) {
                alert("Erreur technique : " + rpcError.message);
                return;
            }

            // @ts-ignore
            if (result && !result.success) {
                // @ts-ignore
                alert("❌ Echec : " + result.message);
            } else {
                alert("✅ Demande de retrait enregistrée ! En attente de validation.");
                refreshData();
            }
        }

        setIsModalOpen(false);
    };

    // Chart logic (Simplified for UI)
    const dailyGains = [
        { day: 'Lun', amount: 0 }, { day: 'Mar', amount: 0 }, { day: 'Mer', amount: 0 },
        { day: 'Jeu', amount: 0 }, { day: 'Ven', amount: 0 }, { day: 'Sam', amount: 0 }, { day: 'Dim', amount: 0 },
    ];

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
                                <Lock size={16} /> Solde minimum de 700 FCFA requis.
                            </div>
                        )}
                    </div>
                    <Wallet size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={openDeposit} style={{ padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
                        <ArrowUpRight size={20} /> Recharger
                    </button>
                    <button onClick={openWithdrawal} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <ArrowDownLeft size={20} /> Retirer
                    </button>
                </div>

                {/* Transaction History */}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#334155' }}>Historique récent</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.length === 0 && <p style={{ color: '#94A3B8', textAlign: 'center', padding: '1rem' }}>Aucune transaction.</p>}

                    {history.map(tx => (
                        <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: tx.type === 'deposit' ? '#ECFDF5' : (tx.status === 'pending' ? '#FFF7ED' : '#FEF2F2'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {tx.type === 'deposit' ? <ArrowDownLeft size={20} color="#10B981" /> : <ArrowUpRight size={20} color={tx.status === 'pending' ? '#F97316' : '#EF4444'} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#1E293B', fontSize: '0.9rem' }}>{tx.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{tx.date}</div>
                                    {tx.status === 'pending' && <span style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: 600 }}>En attente...</span>}
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
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onPaymentComplete={handleTransactionComplete}
            />

            <BottomNav />
        </div>
    );
}
