'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import {
    subscribeUser,
    unsubscribeUser,
} from '@/app/actions/push-notifications';
import { toast } from 'react-hot-toast';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const PushNotificationManager: React.FC = () => {
    const { t } = useTranslation();
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            'PushManager' in window
        ) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register(
                '/sw.js',
                {
                    scope: '/',
                    updateViaCache: 'none',
                }
            );
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    async function subscribeToPush() {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });
            setSubscription(sub);
            const serializedSub = JSON.parse(JSON.stringify(sub));
            await subscribeUser(serializedSub);
            toast.success(t('push_notifications_subscribed_success'));
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error(t('push_notifications_subscribe_error'));
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribeFromPush() {
        setLoading(true);
        try {
            if (subscription) {
                const serializedSub = JSON.parse(JSON.stringify(subscription));
                await unsubscribeUser(serializedSub); // Call server action first
                await subscription.unsubscribe(); // Then unsubscribe locally
                setSubscription(null);
                toast.success(t('push_notifications_unsubscribed_success'));
            }
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            toast.error(t('push_notifications_unsubscribe_error'));
        } finally {
            setLoading(false);
        }
    }

    const handleToggle = () => {
        if (subscription) {
            unsubscribeFromPush();
        } else {
            subscribeToPush();
        }
    };

    if (!isSupported) {
        return (
            <div className="flex cursor-not-allowed items-center opacity-50">
                <div className="flex-1">
                    <p className="text-left">
                        {t('enable_push_notifications')}
                    </p>
                </div>
                <ToggleSwitch
                    checked={false}
                    onChange={() => {}}
                    label=""
                    dataCy="push-notifications-toggle"
                    disabled={true}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('enable_push_notifications')}</p>
            </div>
            <ToggleSwitch
                checked={!!subscription}
                onChange={handleToggle}
                label=""
                dataCy="push-notifications-toggle"
                disabled={loading}
            />
        </div>
    );
};

export default PushNotificationManager;
