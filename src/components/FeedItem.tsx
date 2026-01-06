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
    // Destructure specifically to avoid issues
    const { item, currentUserId, onApply, onManageCandidates, onComplete } = props;

    // Local state for immediate feedback
    const [isLoading, setIsLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(item.myApplicationStatus || null);

    const isAuthor = currentUserId === item.user_id;

    // --- ROBUST HANDLERS ---

    const handleApplyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("🔵 HandleApplyClick triggered for", item.id);

        if (!currentUserId) {
            console.warn("User not logged in -> Redirecting");
            window.location.href = '/login';
            return;
        }

        setIsLoading(true);

        try {
            // Priority 1: Use Parent Prop if available
            if (onApply && typeof onApply === 'function') {
                console.log("Calling parent onApply...");
                await onApply(item.id);
                // Assume success if no error thrown
                setLocalStatus('pending');
                // Parent should reload, but we update local UI instantly
            }
            // Priority 2: Self-Service Fallback (Database Direct)
            else {
                console.log("⚠️ Parent onApply missing. Using Fallback logic.");
                const { data, error } = await supabase.rpc('apply_for_mission', {
                    p_provider_id: currentUserId,
                    p_post_id: item.id
                });

                if (error) throw error;
                if (data && !data.success) throw new Error(data.message || 'Error');

                setLocalStatus('pending');
                alert("✅ Candidature envoyée !");
                window.location.reload();
            }
        } catch (err: any) {
            console.error("Apply Error:", err);
            alert("Erreur: " + (err.message || "Impossible de postuler"));
            setLocalStatus(null); // Revert on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onManageCandidates) {
            onManageCandidates(item.id);
        } else {
            console.error("onManageCandidates missing");
        }
    };

    // --- RENDER HELPERS ---

    const handleNavigation = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank');
    };
    const handleCall = () => { if (item.phoneNumber) window.open(`tel:${item.phoneNumber}`); };
    const handleSMS = () => { if (item.phoneNumber) window.open(`sms:${item.phoneNumber}`); };
    const handleWhatsApp = () => { if (item.phoneNumber) window.open(`https://wa.me/${item.phoneNumber.replace(/\s+/g, '')}`, '_blank'); };

    // Styles
    let borderStyle = '1px solid var(--border)';
    let bgStyle = 'white'; // Default white to be safe

    if (item.status === 'accepted') {
        borderStyle = '2px solid var(--primary)';
        bgStyle = '#F0FDF4';
    } else if (item.isUrgent) {
        borderStyle = '2px solid #EF4444';
        bgStyle = '#FEF2F2';
    }

    const effectiveStatus = localStatus || item.myApplicationStatus;

    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden', border: borderStyle, position: 'relative', backgroundColor: bgStyle }}>

            {/* --- HEADER --- */}
            <div style={{ padding: '1rem', borderBottom: `1px solid ${item.isUrgent ? '#FECACA' : '#E2E8F0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}>
                        {item.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{item.author} {isAuthor && <span style={{ fontSize: '0.7rem', color: '#EF4444' }}>(Moi)</span>}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {item.timestamp} • {item.distance.toFixed(1)} km
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    {item.service}
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div style={{ padding: '1rem' }}>
                <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>{item.description}</p>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Budget: {item.price}</div>

                {/* Audio Note (if any) */}
                {item.audioUrl && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageCircle size={16} />
                        <span style={{ fontSize: '0.9rem' }}>Note vocale disponible</span>
                    </div>
                )}
            </div>

            {/* --- ACTIONS --- */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {/* CASE 1: AUTHOR */}
                {isAuthor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {item.status === 'available' && (
                            <Button fullWidth onClick={handleManageClick} style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                                👥 Voir les candidatures
                            </Button>
                        )}
                        {item.status === 'accepted' && (
                            <>
                                <div style={{ textAlign: 'center', color: '#22C55E', fontWeight: 'bold', fontSize: '0.9rem' }}>✅ Mission en cours</div>
                                <Button fullWidth onClick={() => onComplete(item.id)} style={{ backgroundColor: '#10B981', color: 'white' }}>🏁 Terminer</Button>
                            </>
                        )}
                    </div>
                ) : (
                    // CASE 2: VISITOR / PROVIDER
                    <>
                        {item.status === 'available' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {effectiveStatus === 'pending' ? (
                                    <div style={{
                                        flex: 1,
                                        backgroundColor: '#EFF6FF',
                                        color: '#3B82F6',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}>
                                        ⏳ Candidature envoyée
                                    </div>
                                ) : (
                                    <Button
                                        fullWidth
                                        disabled={isLoading}
                                        onClick={handleApplyClick}
                                        style={{ backgroundColor: 'var(--primary)', opacity: isLoading ? 0.7 : 1 }}
                                    >
                                        {isLoading ? 'Envoi...' : '🤚 Postuler'}
                                    </Button>
                                )}
                            </div>
                        )}

                        {item.status === 'accepted' && (
                            <div style={{ textAlign: 'center', color: '#94A3B8' }}>Mission attribuée à un autre prestataire</div>
                        )}
                    </>
                )}

                {/* SHARED: Contact/Nav (Only if Accepted and involved) */}
                {item.status === 'accepted' && (isAuthor || item.accepted_by === currentUserId) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleCall}><Phone size={16} /></Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleWhatsApp}><MessageCircle size={16} /></Button>
                        <Button variant="outline" style={{ flex: 1 }} onClick={handleNavigation}><Navigation size={16} /></Button>
                    </div>
                )}
            </div>
        </div>
    );
}
