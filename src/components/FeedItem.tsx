'use client';

import React from 'react';
// import { Card } from '@/components/ui/Button'; // Removed invalid import
import { Phone, MessageCircle, MapPin, Clock, Navigation, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FeedItemProps {
    id: number;
    author: string;
    service: string;
    description: string;
    price: string;
    distance: number; // km
    timestamp: string; // ISO or relative
    locationName: string;
    lat: number;
    lng: number;
    status: 'available' | 'accepted';
    user_id: string; // ID of the poster
    phoneNumber?: string; // New field for contact
    audioUrl?: string; // Voice note URL
    rawPrice?: number; // Raw numeric price for calculation
    isUrgent?: boolean; // New Urgency Flag
}

interface FeedItemComponentProps {
    item: FeedItemProps;
    currentUserId?: string; // ID of the logged-in user
    onAccept: (id: number) => void;
    onComplete: (id: number) => void;
    onEdit?: (id: number, currentPrice: number, currentDesc: string) => void;
    onCancel?: (id: number) => void; // For author to delete/cancel
}

export function FeedItem({ item, currentUserId, onAccept, onComplete, onEdit, onCancel }: FeedItemComponentProps) {
    const isAuthor = currentUserId === item.user_id;

    const handleNavigation = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank');
    };

    const handleCall = () => {
        if (item.phoneNumber) window.open(`tel:${item.phoneNumber}`);
    };

    const handleSMS = () => {
        if (item.phoneNumber) window.open(`sms:${item.phoneNumber}`);
    };

    const handleWhatsApp = () => {
        if (item.phoneNumber) {
            // Clean number for WhatsApp API (remove spaces, etc)
            const cleanNumber = item.phoneNumber.replace(/\s+/g, '').replace('+', '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
        }
    };

    // Style Logic for Urgency
    const borderStyle = item.status === 'accepted'
        ? '2px solid var(--primary)'
        : item.isUrgent
            ? '2px solid #EF4444' // Red Border for Urgency
            : '1px solid var(--border)';

    const bgStyle = item.status === 'accepted'
        ? '#FFF7ED'
        : item.isUrgent
            ? '#FEF2F2' // Light Red BG for Urgency Header
            : 'transparent';

    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden', border: borderStyle, position: 'relative' }}>

            {/* Urgency Badge */}
            {item.isUrgent && item.status === 'available' && (
                <div style={{
                    position: 'absolute', top: 0, right: 0,
                    backgroundColor: '#EF4444', color: 'white',
                    fontSize: '0.7rem', fontWeight: 'bold',
                    padding: '2px 8px',
                    borderBottomLeftRadius: '8px',
                    zIndex: 1
                }}>
                    ⚡ URGENCE (+20%)
                </div>
            )}

            {/* Header: Author & Meta */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: bgStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}>
                        {item.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            <a href="/profile/view" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                {item.author} {isAuthor && <span style={{ fontSize: '0.7rem', color: '#EF4444', marginLeft: '4px' }}>(Moi)</span>}
                            </a>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Clock size={12} /> {item.timestamp}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary)' }}>
                                <MapPin size={12} /> {item.distance.toFixed(1)} km
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #FFE4E6' }}>
                    {item.service}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1rem' }}>

                {/* Audio Player if present */}
                {item.audioUrl && (
                    <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748B' }}>🎤 Message vocal</div>
                        <audio controls src={item.audioUrl} style={{ width: '100%', height: '32px' }} />
                    </div>
                )}

                <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                    {item.description}
                </p>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: item.isUrgent ? '#B91C1C' : 'inherit' }}>
                    Budget: {item.price} {item.isUrgent && <span style={{ fontSize: '0.8rem' }}>⚡</span>}
                </div>

                {/* Price Suggestion for Author */}
                {isAuthor && item.status === 'available' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#F59E0B', fontStyle: 'italic' }}>
                        💡 Conseil : Si personne n'accepte, essayez d'augmenter le budget.
                    </div>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📍 {item.locationName}</span>
                    <button
                        onClick={handleNavigation}
                        style={{
                            background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 500
                        }}
                    >
                        <Navigation size={14} style={{ marginRight: '4px' }} /> Y aller
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {isAuthor ? (
                    // AUTHOR ACTIONS
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Button fullWidth variant="outline" onClick={() => onEdit && onEdit(item.id, parseFloat(item.price), item.description)}>
                            ✏️ Modifier / Augmenter Prix
                        </Button>
                        {item.status === 'accepted' && (
                            <>
                                <Button fullWidth onClick={() => window.location.href = `/tracking?id=${item.id}`} variant="secondary">
                                    👁️ Suivre Prestataire (GPS)
                                </Button>
                                <Button fullWidth onClick={() => onComplete(item.id)} style={{ backgroundColor: '#10B981', color: 'white' }}>
                                    ✅ Travail Terminé & Noter
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    // VISITOR / PROVIDER ACTIONS
                    item.status === 'available' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="outline" fullWidth style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                                <MessageCircle size={18} style={{ marginRight: '0.5rem' }} /> Message
                            </Button>
                            <Button fullWidth onClick={() => onAccept(item.id)}
                                style={{ backgroundColor: item.isUrgent ? '#EF4444' : 'var(--primary)' }}>
                                <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> {item.isUrgent ? 'Sauver la mise !' : 'Accepter'}
                            </Button>
                        </div>
                    ) : (
                        // ACCEPTED VIEW (For Provider)
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)', padding: '0.5rem', backgroundColor: '#FFF7ED', borderRadius: 'var(--radius)' }}>
                                📞 Contact: {item.phoneNumber || 'Non renseigné'}
                            </div>

                            {/* Contact Actions Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Button fullWidth onClick={handleCall} style={{ backgroundColor: '#22C55E' }}>
                                    <Phone size={16} /> Appeler
                                </Button>
                                <Button fullWidth onClick={handleSMS} style={{ backgroundColor: '#3B82F6' }}>
                                    <MessageCircle size={16} /> SMS
                                </Button>
                                <Button fullWidth onClick={handleWhatsApp} style={{ backgroundColor: '#25D366' }}>
                                    WhatsApp
                                </Button>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>

                            {/* Provider Operational Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button fullWidth onClick={handleNavigation} style={{ backgroundColor: '#2563EB' }}>
                                    GPS Interne 🧭
                                </Button>
                                {/* Provider cannot finish the job anymore. Only Author can. */}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
