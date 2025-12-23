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
    phoneNumber?: string; // New field for contact
    audioUrl?: string; // Voice note URL
}

interface FeedItemComponentProps {
    item: FeedItemProps;
    onAccept: (id: number) => void;
    onConfirmArrival: (id: number) => void;
}

export function FeedItem({ item, onAccept, onConfirmArrival }: FeedItemComponentProps) {

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

    return (
        <div className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden', border: item.status === 'accepted' ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
            {/* Header: Author & Meta */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: item.status === 'accepted' ? '#FFF7ED' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}>
                        {item.author.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            <a href="/profile/view" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                {item.author}
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
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Budget: {item.price}
                </div>
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

                {item.status === 'available' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" fullWidth style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                            <MessageCircle size={18} style={{ marginRight: '0.5rem' }} /> Message
                        </Button>
                        <Button fullWidth onClick={() => onAccept(item.id)}>
                            <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Accepter
                        </Button>
                    </div>
                ) : (
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
                                Or WhatsApp
                            </Button>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>

                        {/* Client Simulation Actions */}
                        <div style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                            <Button fullWidth onClick={() => window.location.href = '/tracking'} variant="secondary" style={{ marginBottom: '0.5rem' }}>
                                👁️ Voir suivi temps réel (Vue Annonceur)
                            </Button>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button fullWidth onClick={handleNavigation} style={{ backgroundColor: '#2563EB' }}>
                                    <Navigation size={18} style={{ marginRight: '0.5rem' }} /> GPS
                                </Button>
                                <Button fullWidth onClick={() => onConfirmArrival(item.id)} variant="outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                                    ✅ Terminé
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
