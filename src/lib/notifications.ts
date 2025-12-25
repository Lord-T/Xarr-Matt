import webpush from 'web-push';
import { supabase } from './supabase'; // Ensure this is the ADMIN client for backend if possible, or standard client

// Initialize Web Push
// Note: We need to ensure these env vars are available
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

if (publicKey && privateKey) {
    webpush.setVapidDetails(
        'mailto:contact@xarr-matt.com',
        publicKey,
        privateKey
    );
}

export async function sendNotificationToUser(userId: string, title: string, body: string, url = '/') {
    // 1. Get User Subscriptions
    const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

    if (!subs || subs.length === 0) return { success: false, error: 'No subscriptions' };

    // 2. Send to all endpoints (User might be on phone + laptop)
    const results = await Promise.all(subs.map(async sub => {
        try {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            const payload = JSON.stringify({ title, body, url });
            await webpush.sendNotification(pushConfig, payload);
            return { status: 'fulfilled' };
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription expired/gone, delete it
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
            return { status: 'rejected', error };
        }
    }));

    return { success: true, results };
}

export async function sendBroadcastNotification(title: string, body: string, url = '/') {
    const { data: subs } = await supabase.from('push_subscriptions').select('*');
    if (!subs) return;

    // Batch process
    await Promise.all(subs.map(async sub => {
        try {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
            };
            await webpush.sendNotification(pushConfig, JSON.stringify({ title, body, url }));
        } catch (e: any) {
            if (e.statusCode === 410) {
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
        }
    }));
}
