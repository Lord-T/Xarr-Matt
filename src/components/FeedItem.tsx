'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Navigation, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

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
    status: 'available' | 'accepted' | 'pending_approval';
    user_id: string;
    phoneNumber?: string | null;
    audioUrl?: string;
    rawPrice?: number;
    isUrgent?: boolean;
    accepted_by?: string;
    myApplicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

interface FeedItemComponentProps {
    item: FeedItemProps;
    currentUserId?: string;
    onApply?: (id: string | number) => void;
    onManageCandidates?: (id: string | number) => void;
    onComplete: (id: string | number) => void;
    onEdit?: (id: string | number, currentPrice: number, currentDesc: string) => void;
    onCancel?: (id: string | number) => void;
}

export function FeedItem(props: FeedItemComponentProps) {
    const { item, currentUserId, onApply, onComplete } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(item.myApplicationStatus || null);

    // --- AUTONOMOUS CANDIDATE VIEW STATE ---
    const [showCandidates, setShowCandidates] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    const isAuthor = currentUserId === item.user_id;

    // --- HANDLERS ---

    const handleApplyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) { window.location.href = '/login'; return; }

        setIsLoading(true);
        try {
            // Try Standard Prop first
            if (onApply && typeof onApply === 'function') {
                await onApply(item.id);
                setLocalStatus('pending');
            } else {
                // Fallback
                const { data, error } = await supabase.rpc('apply_for_mission', { p_provider_id: currentUserId, p_post_id: item.id });
                if (error) throw error;
                setLocalStatus('pending');
                alert("✅ Candidature envoyée !");
                // Optional: reload to refresh everything
                window.location.reload();
            }
        } catch (err: any) {
            alert("Erreur: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Toggle
        if (showCandidates) {
            setShowCandidates(false);
            return;
        }

        setShowCandidates(true);
        setLoadingCandidates(true);

        try {
            console.log("Fetching candidates for", item.id);
            const { data, error } = await supabase.rpc('get_post_applications', { p_post_id: item.id });
            if (error) throw error;
            setCandidates(data || []);
        } catch (err: any) {
            alert("Erreur chargement: " + err.message);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleApproveProvider = async (providerId: string) => {
        // Calculate ~10% fee
        let fee = 500;
        if (item.rawPrice) fee = Math.floor(item.rawPrice * 0.10);
        else {
            const clean = String(item.price).replace(/[^\d]/g, '');
            if (clean) fee = Math.floor(parseInt(clean) * 0.10);
        }
        if (fee < 100) fee = 100;

        if (!confirm("Voulez-vous confirmer ce prestataire pour la mission ?")) return;

        try {
            const { data: result, error } = await supabase.rpc('approve_provider', {
                p_post_id: item.id,
                p_provider_id: providerId,
                p_fee: fee
            });

            if (error || (result && !result.success)) {
                throw new Error(error?.message || result?.message);
            }

            alert("✅ Prestataire validé !");
            window.location.reload();

        } catch (err: any) {
            alert("Erreur validation: " + err.message);
        }
    };

    // --- RENDER HELPERS ---
    const handleCall = () => { if (item.phoneNumber) window.open(`tel:${item.phoneNumber}`); };
    const handleWhatsApp = () => { if (item.phoneNumber) window.open(`https://wa.me/${item.phoneNumber.replace(/\s+/g, '')}`, '_blank'); };
    const handleNavigation = () => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank'); };

    let borderStyle = '1px solid var(--border)';
    let bgStyle = 'white';
    if (item.status === 'accepted') { borderStyle = '2px solid var(--primary)'; bgStyle = '#F0FDF4'; }
    else if (item.isUrgent) { borderStyle = '2px solid #EF4444'; bgStyle = '#FEF2F2'; }

    const effectiveStatus = localStatus || item.myApplicationStatus;

    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden', border: borderStyle, backgroundColor: bgStyle, position: 'relative' }}>

            {/* HEADER */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}>
                        {item.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{item.author} {isAuthor && <span style={{ fontSize: '0.8em', color: 'red' }}>(Moi)</span>}</div>
                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{item.timestamp} • {item.distance.toFixed(1)} km</div>
                    </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{item.service}</div>
            </div>

            {/* CONTENT */}
            <div style={{ padding: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>{item.description}</p>
                <div style={{ fontWeight: 'bold' }}>{item.price}</div>
                {item.audioUrl && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageCircle size={16} />
                        <span style={{ fontSize: '0.9rem' }}>Note vocale disponible</span>
                    </div>
                )}
            </div>

            {/* CANDIDATE LIST (AUTONOMOUS) */}
            {showCandidates && isAuthor && (
                <div style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '1rem' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Candidatures ({candidates.length})</h4>

                    {loadingCandidates && <div style={{ textAlign: 'center', padding: '1rem' }}>Chargement...</div>}

                    {!loadingCandidates && candidates.length === 0 && (
                        <div style={{ color: 'gray', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>Aucun candidat pour le moment.</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {candidates.map(c => (
                            <div key={c.id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {c.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.profession || 'Prestataire'}</div>
                                            {/* SHOW PHONE BEFORE VALIDATION AS REQUESTED */}
                                            <div style={{ fontSize: '0.8rem', color: '#3B82F6', marginTop: '2px' }}>
                                                📞 {c.phone || c.contact_phone || 'Non renseigné'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'gold' }}>★ {c.rating ? c.rating.toFixed(1) : 'NEW'}</div>
                                </div>

                                {c.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <button
                                            onClick={() => window.open(`/profile/${c.provider_id}`, '_blank')}
                                            style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: 'white' }}
                                        >
                                            👤 Voir Profil
                                        </button>
                                        <button
                                            onClick={() => handleApproveProvider(c.provider_id)}
                                            style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', background: '#10B981', color: 'white', fontWeight: 600 }}
                                        >
                                            ✅ Valider
                                        </button>
                                    </div>
                                )}
                                {c.status === 'accepted' && <div style={{ color: '#10B981', textAlign: 'center', fontWeight: 'bold', marginTop: '0.5rem' }}>✅ CHOISI</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIONS */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isAuthor ? (
                    item.status === 'available' || item.status === 'pending_approval' ? (
                        <Button fullWidth onClick={handleManageClick} style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                            {showCandidates ? '🔼 Masquer Candidatures' : '👥 Voir les candidatures'}
                        </Button>
                    ) : (
                        <Button fullWidth onClick={() => onComplete(item.id)} style={{ backgroundColor: '#10B981', color: 'white' }}>🏁 Terminer Mission</Button>
                    )
                ) : (
                    // VISITOR
                    item.status === 'available' && (
                        effectiveStatus === 'pending' ? (
                            <div style={{ padding: '0.5rem', background: '#EFF6FF', color: '#3B82F6', textAlign: 'center', borderRadius: '6px', fontWeight: 600 }}>⏳ Candidature envoyée</div>
                        ) : (
                            <Button fullWidth disabled={isLoading} onClick={handleApplyClick} style={{ backgroundColor: 'var(--primary)' }}>
                                {isLoading ? '...' : '🤚 Postuler'}
                            </Button>
                        )
                    )
                )}

                {/* CONTACT BUTTONS IF ACCEPTED */}
                {item.status === 'accepted' && (isAuthor || item.accepted_by === currentUserId) && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleCall}><Phone size={16} /></Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleWhatsApp}><MessageCircle size={16} /></Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleNavigation}><Navigation size={16} /></Button>
                    </div>
                )}
            </div>
        </div>
    );
}
