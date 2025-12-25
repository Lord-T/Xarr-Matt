'use client';

import React from 'react';
import {
    LayoutDashboard, Users, Wallet, Image, Settings,
    LogOut, ExternalLink, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminTab = 'dashboard' | 'users' | 'finances' | 'content' | 'system';

interface AdminSidebarProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'finances', label: 'Finances', icon: Wallet },
        { id: 'content', label: 'Contenu & Pubs', icon: Image },
        { id: 'system', label: 'Système', icon: Settings },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <h1 className="font-bold text-lg">SuperPanel</h1>
                </div>
                <p className="text-xs text-slate-400">Xarr-Matt Administration</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id as AdminTab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-medium'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
                    <ExternalLink size={20} />
                    <span>Retour au Site</span>
                </Link>
            </div>
        </div>
    );
}
