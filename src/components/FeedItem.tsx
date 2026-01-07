'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, Navigation, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

// --- V5 STRICT INTERFACE ---
export interface FeedItemProps {
    id: string | number;
    author: string;
    service: string;
    description: string;
    price: string;
    distance: number;
    timestamp: string;
    locationName: string;
    lat: number;
    lng: number;
    // Official States from SQL V5
    status: 'available' | 'in_progress' | 'completed';
    user_id: string;
    phoneNumber?: string | null;
    audioUrl?: string; // Optional
    rawPrice?: number;
    isUrgent?: boolean;
    accepted_by?: string;
    // Official Application State from SQL V5
    myApplicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

interface FeedItemComponentProps {
    item: FeedItemProps;
    currentUserId?: string;
    onApply?: (id: string | number) => void;
    onManageCandidates?: (id: string | number) => void;
    onComplete: (id: string | number) => void;
}

export function FeedItem(props: FeedItemComponentProps) {
    const { item, currentUserId, onApply, onComplete } = props;
    const isAuthor = currentUserId === item.user_id;

    // Local state for UI feedback (loading/optimistic updates)
    const [isLoading, setIsLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(item.myApplicationStatus || null);

    // --- CANDIDATE MODAL STATE ---
    const [showCandidates, setShowCandidates] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // --- EFFECTIVE STATUS (Server Source of Truth preferred) ---
    const effectiveStatus = item.myApplicationStatus || localStatus;

    // --- ACTIONS V5 ---

    // 1. PROVIDER: APPLY
    const handleApplyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) { window.location.href = '/login'; return; }

        setIsLoading(true);
        try {
            // Call V6 RPC (Secure - uses auth.uid() implicitly)
            const { data, error } = await supabase.rpc('apply_for_mission', { p_post_id: item.id });

            if (error) {
                alert("Erreur: " + error.message);
            } else if (!data.success) {
                alert("Impossible: " + data.message);
            } else {
                setLocalStatus('pending'); // UI Feedback
                alert("✅ Candidature envoyée ! En attente de validation.");
                if (onApply) onApply(item.id); // Parent Refresh
            }
        } catch (err: any) {
            alert("Erreur technique: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. ADVERTISER: VIEW CANDIDATES & APPROVE
    const handleManageClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showCandidates) { setShowCandidates(false); return; }

        setShowCandidates(true);
        setLoadingCandidates(true);
        try {
            const { data, error } = await supabase.rpc('get_post_applications', { p_post_id: item.id });
            if (error) throw error;
            setCandidates(data || []);
        } catch (err: any) {
            alert("Erreur chargement: " + err.message);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleApproveProvider = async (providerId: string, providerName: string) => {
        // Calculate 10% Fee logic (Frontend estimation, constrained by DB)
        let fee = 0;
        if (item.rawPrice) fee = Math.floor(item.rawPrice * 0.10);
        else {
            // Fallback parsing
            const clean = String(item.price).replace(/[^\d]/g, '');
            if (clean) fee = Math.floor(parseInt(clean) * 0.10);
        }
        if (fee < 100) fee = 100; // Minimum safety

        if (!confirm(`Confirmer ${providerName} pour cette mission ?\n\nCela débitera ${fee} FCFA de SON solde et fermera l'annonce.`)) return;

        try {
            const { data, error } = await supabase.rpc('approve_provider', {
                p_post_id: item.id,
                p_provider_id: providerId,
                p_fee: fee
            });

            if (error || (data && !data.success)) {
                alert("Erreur: " + (error?.message || data?.message));
            } else {
                alert("✅ Prestataire validé ! Mission en cours.");
                window.location.reload(); // Force strict sync
            }
        } catch (err: any) {
            alert("Erreur: " + err.message);
        }
    };

    // --- STYLES ---
    let borderStyle = '1px solid var(--border)';
    let bgStyle = 'white';

    // VISUAL CUES V5
    if (item.status === 'in_progress') {
        borderStyle = '2px solid #10B981'; // Green for Active Mission
        bgStyle = '#F0FDF4';
    } else if (item.isUrgent) {
        borderStyle = '2px solid #EF4444';
        bgStyle = '#FEF2F2';
    }

    // --- RENDER MATRIX (THE CONSTITUTION) ---
    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden', border: borderStyle, backgroundColor: bgStyle }}>

            {/* HEADER */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}>
                        {item.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{item.author} {isAuthor && <span style={{ color: 'red', fontSize: '0.8em' }}>(Moi)</span>}</div>
                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{item.timestamp} • {item.distance.toFixed(1)} km</div>
                    </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{item.service}</div>
            </div>

            {/* BODY */}
            <div style={{ padding: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>{item.description}</p>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.price}</div>
                {item.audioUrl && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={16} />
                        <span style={{ fontSize: '0.9rem' }}>Note vocale</span>
                    </div>
                )}
            </div>

            {/* --- ADVERTISER VIEW: CANDIDATES --- */}
            {isAuthor && showCandidates && (
                <div style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '1rem' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Candidatures ({candidates.length})</h4>
                    {loadingCandidates && <div>Chargement...</div>}
                    {!loadingCandidates && candidates.length === 0 && <div style={{ fontStyle: 'italic', color: 'gray' }}>Aucun candidat.</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {candidates.map(c => (
                            <div key={c.id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{c.full_name} <span style={{ fontWeight: 400, color: 'gray' }}>({c.job || 'Prestataire'})</span></div>
                                    <div style={{ color: 'gold' }}>★ {c.rating ? Number(c.rating).toFixed(1) : 'NEW'}</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#3B82F6', marginBottom: '0.5rem' }}>📞 {c.phone || 'Masqué'}</div>

                                {c.status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => window.open(`/profile/${c.provider_id}`, '_blank')} style={{ flex: 1, padding: '0.3rem', border: '1px solid #CBD5E1', borderRadius: '4px', background: 'white' }}>Voir Profil</button>
                                        <button onClick={() => handleApproveProvider(c.provider_id, c.full_name)} style={{ flex: 1, padding: '0.3rem', border: 'none', borderRadius: '4px', background: '#10B981', color: 'white', fontWeight: 600 }}>✅ Accepter</button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', fontWeight: 'bold', color: c.status === 'accepted' ? '#10B981' : '#EF4444' }}>
                                        {c.status === 'accepted' ? 'CHOISI' : 'REFUSÉ'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- ACTION BUTTONS (The Matrix) --- */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)' }}>

                {/* 🟢 CAS 1: ANNONCEUR */}
                {isAuthor && (
                    item.status === 'available' ? (
                        <Button fullWidth onClick={handleManageClick} style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                            {showCandidates ? '🔼 Masquer' : '👥 Voir les candidatures'}
                        </Button>
                    ) : item.status === 'in_progress' ? (
                        <Button fullWidth onClick={() => onComplete(item.id)} style={{ backgroundColor: '#10B981', color: 'white' }}>
                            🏁 Terminer la mission
                        </Button>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'gray', padding: '0.5rem' }}>Mission terminée</div>
                    )
                )}

                {/* 🔵 CAS 2: PRESTATAIRE (VISITEUR) - MATRICE V6 STRICTE */}
                {!isAuthor && (
                    <>
                        {/* A. PENDING (En attente) */}
                        {effectiveStatus === 'pending' && (
                            <div style={{ padding: '0.75rem', background: '#FEF3C7', color: '#D97706', textAlign: 'center', borderRadius: '12px', fontWeight: 600, border: '1px solid #FDE68A' }}>
                                🕒 En attente de réponse...
                            </div>
                        )}

                        {/* B. ACCEPTED (Accepté) */}
                        {(effectiveStatus === 'accepted' || item.accepted_by === currentUserId) && (
                            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1rem' }}>
                                <div style={{ color: '#15803D', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
                                    🎉 Candidature Retenue !
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <Button variant="outline" fullWidth onClick={() => item.phoneNumber && window.open(`tel:${item.phoneNumber}`)}>
                                        <Phone size={16} className="mr-2" /> Appeler ({item.phoneNumber})
                                    </Button>
                                    {item.lat && item.lng && (
                                        <Button variant="outline" fullWidth onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`)}>
                                            <Navigation size={16} className="mr-2" /> Y Aller
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* C. REJECTED (Refusé) */}
                        {effectiveStatus === 'rejected' && (
                            <div style={{ textAlign: 'center', color: '#EF4444', fontWeight: 'bold', padding: '0.75rem' }}>
                                ❌ Candidature non retenue
                            </div>
                        )}

                        {/* D. POSTULER (Seulement si Available ET Pas de statut) */}
                        {item.status === 'available' && !effectiveStatus && (
                            <Button fullWidth onClick={handleApplyClick} disabled={isLoading} style={{ backgroundColor: 'black', color: 'white' }}>
                                {isLoading ? 'Envoi...' : '🚀 Postuler'}
                            </Button>
                        )}

                        {/* E. NON DISPONIBLE (Si pas available et pas accepté) */}
                        {item.status !== 'available' && effectiveStatus !== 'accepted' && item.accepted_by !== currentUserId && (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '0.5rem', fontStyle: 'italic' }}>
                                Mission non disponible
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
