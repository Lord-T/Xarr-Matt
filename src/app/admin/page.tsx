'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { Loader } from 'lucide-react';

// Modules (Real implementations)
import { UsersModule } from '@/components/admin/modules/UsersModule';
import { FinancesModule } from '@/components/admin/modules/FinancesModule';
import { ContentModule } from '@/components/admin/modules/ContentModule';
import { SystemModule } from '@/components/admin/modules/SystemModule';
import { DashboardModule } from '@/components/admin/modules/DashboardModule';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. HARDCODED SUPER ADMIN (Safe Fallback)
            const isEmailAdmin = user.email === 'ahmadoumanelfall@gmail.com' || user.email === 'ahmadeinstein4@gmail.com';

            // 2. DB ROLE CHECK
            const { data: roleData } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            const isDbAdmin = !!roleData;

            if (isEmailAdmin || isDbAdmin) {
                setIsAdmin(true);
                setLoading(false);
            } else {
                router.push('/');
            }
        };
        checkAdmin();

    }, [router]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <Loader className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">
                            {activeTab === 'dashboard' ? 'Vue d\'ensemble' : activeTab}
                        </h2>
                        <p className="text-slate-500 text-sm">Gestion globale de la plateforme</p>
                    </div>
                </header>

                {/* Module Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] p-6">
                    {activeTab === 'dashboard' && <DashboardModule onNavigate={(tab: any) => setActiveTab(tab)} />}
                    {activeTab === 'users' && <UsersModule />}
                    {activeTab === 'finances' && <FinancesModule />}
                    {activeTab === 'content' && <ContentModule />}
                    {activeTab === 'system' && <SystemModule />}
                </div>
            </main>
        </div>
    );
}
