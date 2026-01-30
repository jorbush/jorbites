'use server';

import webpush from 'web-push';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

if (
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
) {
    console.warn('VAPID keys are missing. Push notifications will not work.');
} else {
    webpush.setVapidDetails(
        'mailto:jorbites.app@gmail.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function subscribeUser(sub: webpush.PushSubscription) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Not authenticated');
    }

    if (!sub || !sub.endpoint || !sub.keys) {
        throw new Error('Invalid subscription object');
    }

    try {
        await prisma.pushSubscription.create({
            data: {
                userId: currentUser.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
            },
        });
        return { success: true };
    } catch (error: any) {
        // If it already exists (unique constraint), that's fine, just return success
        if (error.code === 'P2002') {
            return { success: true };
        }
        console.error('Error saving subscription:', error);
        return { success: false, error: 'Failed to save subscription' };
    }
}

export async function unsubscribeUser(sub?: webpush.PushSubscription | null) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Not authenticated');
    }

    if (!sub || !sub.endpoint) {
        return { success: false, error: 'No subscription provided' };
    }

    try {
        await prisma.pushSubscription.deleteMany({
            where: {
                userId: currentUser.id,
                endpoint: sub.endpoint,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting subscription:', error);
        return { success: false, error: 'Failed to delete subscription' };
    }
}

export async function sendPushToUser(
    userId: string,
    message: string,
    url: string = '/'
) {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                userId: userId,
            },
        });

        if (subscriptions.length === 0) {
            return { success: false, error: 'No subscriptions found for user' };
        }

        const notifications = subscriptions.map((sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            const payload = JSON.stringify({
                title: 'Jorbites',
                body: message,
                icon: '/web-app-manifest-192x192.png',
                url: url,
            });

            return webpush
                .sendNotification(pushSubscription, payload)
                .catch(async (err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription is gone, delete it
                        console.log(
                            'Subscription expired, deleting...',
                            sub.id
                        );
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    } else {
                        throw err;
                    }
                });
        });

        await Promise.all(notifications);
        return { success: true };
    } catch (error) {
        console.error('Error sending push notification to user:', error);
        return { success: false, error: 'Failed to send notifications' };
    }
}
