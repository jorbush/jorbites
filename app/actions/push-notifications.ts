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
