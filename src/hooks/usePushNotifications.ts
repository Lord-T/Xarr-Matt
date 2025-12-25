'use client';

import { useState, useEffect } from 'react';
import { subscribeUser } from '@/app/actions/notifications';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            registerSW();
        }
    }, []);

    const registerSW = async () => {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    };

    const subscribe = async () => {
        if (!isSupported) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            setSubscription(sub);
            setPermission('granted');

            // Send to Server
            // @ts-ignore
            await subscribeUser(JSON.parse(JSON.stringify(sub)));
            alert("Notifications activées avec succès ! 🔔");
        } catch (error) {
            console.error('Failed to subscribe', error);
            alert("Erreur lors de l'activation des notifications.");
        }
    };

    const unsubscribe = async () => {
        if (subscription) {
            await subscription.unsubscribe();
            setSubscription(null);
            // TODO: Call server to remove
        }
    };

    return {
        isSupported,
        permission,
        subscription,
        subscribe,
        unsubscribe
    };
}
