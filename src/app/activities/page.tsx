'use client';

import React, { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { ArrowLeft, Clock, MapPin, ChevronRight, RotateCcw, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function ActivitiesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');

    // Mock Data
    const ongoingActivities = [
        { id: 1, service: "Plomberie", status: "Recherche en cours...", time: "Il y a 5 min", location: "Dakar, Plateau", icon: "🔧" },
        { id: 2, service: "Mécanique", status: "Accepté par Modou", time: "Il y a 20 min", location: "Autoroute A1", icon: "🚗", providerId: 123 }
    ];

    const historyActivities = [
        { id: 3, service: "Cuisine (Thiéboudienne)", status: "Terminé", date: "Hier", price: "15 000 FCFA", provider: "Awa Ndiaye", icon: "🥘" },
        { id: 4, service: "Transport Colis", status: "Annulé", date: "20 Dec", price: "-", icon: "📦" }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mes Activités</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0.5rem', margin: '1rem', backgroundColor: '#E2E8F0', borderRadius: '12px' }}>
                <button
                    onClick={() => setActiveTab('ongoing')}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                        backgroundColor: activeTab === 'ongoing' ? 'white' : 'transparent',
                        fontWeight: 600, color: activeTab === 'ongoing' ? '#0F172A' : '#64748B',
                        boxShadow: activeTab === 'ongoing' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s', cursor: 'pointer'
                    }}
                >
                    En cours
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                        backgroundColor: activeTab === 'history' ? 'white' : 'transparent',
                        fontWeight: 600, color: activeTab === 'history' ? '#0F172A' : '#64748B',
                        boxShadow: activeTab === 'history' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s', cursor: 'pointer'
                    }}
                >
                    Historique
                </button>
            </div>

            <div style={{ padding: '0 1rem', flex: 1 }}>

                {/* Ongoing List */}
                {activeTab === 'ongoing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ongoingActivities.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '2rem' }}>Aucune activité en cours.</p>}

                        {ongoingActivities.map(activity => (
                            <div key={activity.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>{activity.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{activity.service}</div>
                                            <div style={{ fontSize: '0.85rem', color: activity.status.includes('Recherche') ? '#F59E0B' : '#10B981', fontWeight: 500 }}>
                                                {activity.status}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{activity.time}</span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MapPin size={14} /> {activity.location}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {activity.providerId ? (
                                        <Button fullWidth onClick={() => router.push('/tracking')} size="sm" style={{ backgroundColor: '#2563EB' }}>
                                            Suivre l'arrivée
                                        </Button>
                                    ) : (
                                        <Button fullWidth size="sm" variant="outline" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                                            <XCircle size={16} style={{ marginRight: '0.5rem' }} /> Annuler
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* History List */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {historyActivities.map(activity => (
                            <div key={activity.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', width: '30px', height: '30px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activity.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{activity.service}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{activity.date} • {activity.status}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{activity.price}</div>
                                </div>

                                {activity.provider && (
                                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.75rem' }}>
                                        Prestataire : <span style={{ color: '#0F172A', fontWeight: 500 }}>{activity.provider}</span>
                                    </div>
                                )}

                                <Button fullWidth size="sm" variant="secondary" style={{ color: '#0F172A' }}>
                                    <RotateCcw size={16} style={{ marginRight: '0.5rem' }} /> Commander à nouveau
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <BottomNav />
        </div>
    );
}
