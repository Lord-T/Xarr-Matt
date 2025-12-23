'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, CreditCard, User, List } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div style={{
            height: '60px',
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1001,
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
        }}>
            {/* <NavItem icon={<User size={24} />} label="Menu" href="/settings" active={pathname === '/settings'} /> (Moved to Top Burger) */}
            <NavItem icon={<Search size={24} />} label="Carte" href="/map" active={pathname === '/map'} />

            {/* FAB Style Button for Post */}
            <div style={{ position: 'relative', top: '-15px' }}>
                <Link href="/post">
                    <button style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(249, 115, 22, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <PlusCircle size={32} />
                    </button>
                </Link>
            </div>

            <NavItem icon={<List size={24} />} label="Fil" href="/" active={pathname === '/'} />
            <NavItem icon={<CreditCard size={24} />} label="Wallet" href="/wallet" active={pathname === '/wallet'} />
        </div>
    );
}

function NavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: active ? 'var(--primary)' : 'var(--muted)',
            textDecoration: 'none',
            gap: '2px'
        }}>
            {icon}
            <span style={{ fontSize: '0.7rem' }}>{label}</span>
        </Link>
    );
}
