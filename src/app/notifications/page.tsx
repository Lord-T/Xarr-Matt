'use client';

import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft, Bell, MessageCircle, CreditCard, CheckCircle, TicketPercent } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchNotifications();

        // Mark all as read on mount (simplified logic)
        // markAllAsRead(); 
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
        if (!user) return;

        const { data, error } = await import('@/lib/supabase').then(m => m.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }));

        if (data) setNotifications(data);
        setLoading(false);
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
        if (user) {
            await import('@/lib/supabase').then(m => m.supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'wallet': return <CreditCard size={20} color="#10B981" />;
            case 'success': return <CheckCircle size={20} color="#2563EB" />;
            case 'info': return <Bell size={20} color="#64748B" />;
            case 'warning': return <Bell size={20} color="#F59E0B" />;
            default: return <Bell size={20} color="#64748B" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'wallet': return '#ECFDF5';
            case 'success': return '#EFF6FF';
            case 'warning': return '#FFFBEB';
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div className="p-10 text-center text-gray-400">Chargement...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">Aucune notification pour le moment.</div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1rem', backgroundColor: notif.read ? 'white' : '#F8FAFC' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: getBgColor(notif.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {getIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: notif.read ? 600 : 700, color: '#0F172A', fontSize: '0.95rem' }}>{notif.title}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                                    {notif.message}
                                </p>
                            </div>
                            {!notif.read && (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', marginTop: '0.5rem' }}></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}
