'use server';

import { createClient } from '@/utils/supabase/server'; // Or component level client if needed
// Actually, for Server Actions, we should use a proper Server Client constructor
// Assuming we have one, or using the simple one if RLS allows.
// Since we are inserting into 'push_subscriptions' which relates to auth.uid(), standard client is fine.
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Helper to get supabase client in server action
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch { }
                },
            },
        }
    );
}

export async function subscribeUser(sub: any) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Format for DB
    const payload = {
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth
    };

    const { error } = await supabase.from('push_subscriptions').insert(payload); // Upsert? Endpoint constraint is unique.

    if (error) {
        // If unique violation, it's fine, user already subbed.
        if (error.code === '23505') return { success: true };
        console.error('Sub Error', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

import { sendBroadcastNotification } from '@/lib/notifications';

export async function sendBroadcast(message: string) {
    // 1. Auth Check (Admin only)
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    // In real app, check 'admin_roles' here
    if (!user) return { success: false, error: 'Unauthorized' };

    await sendBroadcastNotification("📢 Xarr-Matt Info", message);
    return { success: true };
}
