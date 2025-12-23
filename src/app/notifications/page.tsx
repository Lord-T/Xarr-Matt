'use client';

import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft, Bell, MessageCircle, CreditCard, CheckCircle, TicketPercent } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();

    // Mock Data
    const notifications = [
        { id: 1, type: 'system', title: 'Bienvenue sur Xarr-Matt !', message: 'Complétez votre profil pour gagner 500 FCFA de crédit offert.', time: 'À l\'instant', read: false },
        { id: 2, type: 'mission', title: 'Course Terminée', message: 'Vous avez noté Modou Fall 5 étoiles. Merci pour votre retour !', time: 'Il y a 1h', read: true },
        { id: 3, type: 'wallet', title: 'Rechargement Reçu', message: 'Votre compte a été crédité de 5000 FCFA via Wave.', time: 'Il y a 3h', read: true },
        { id: 4, type: 'promo', title: 'Promo Tabaski 🐑', message: '-20% sur tous les services de couture cette semaine !', time: 'Hier', read: true },
        { id: 5, type: 'message', title: 'Nouveau message', message: 'Awa Ndiaye : "J\'arrive dans 5 minutes, il y a des embouteillages..."', time: 'Hier', read: true },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'wallet': return <CreditCard size={20} color="#10B981" />;
            case 'mission': return <CheckCircle size={20} color="#2563EB" />;
            case 'promo': return <TicketPercent size={20} color="#F59E0B" />;
            case 'message': return <MessageCircle size={20} color="#8B5CF6" />;
            default: return <Bell size={20} color="#64748B" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'wallet': return '#ECFDF5';
            case 'mission': return '#EFF6FF';
            case 'promo': return '#FFFBEB';
            case 'message': return '#F5F3FF';
            default: return '#F1F5F9';
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Notifications</h1>
                <div style={{ marginLeft: 'auto', backgroundColor: '#EF4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                    1 nouvelle
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1rem', backgroundColor: notif.read ? 'white' : '#F8FAFC' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: getBgColor(notif.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {getIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: notif.read ? 600 : 700, color: '#0F172A', fontSize: '0.95rem' }}>{notif.title}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{notif.time}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                                {notif.message}
                            </p>
                        </div>
                        {!notif.read && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', marginTop: '0.5rem' }}></div>
                        )}
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
