'use server';

import webpush from 'web-push';
import prisma from '@/app/lib/prismadb';
import getCurrentUser, { auth } from '@/app/actions/getCurrentUser';
import { unauthorized } from 'next/navigation';
import { after } from 'next/server';
import { logger } from '@/app/lib/axiom/server';
import { VAPID_EMAIL } from '@/app/utils/constants';

declare global {
    var isPushInitialized: boolean | undefined;
}

function ensureWebPushInitialized() {
    if (globalThis.isPushInitialized) return;

    if (
        !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        !process.env.VAPID_PRIVATE_KEY
    ) {
        after(() => {
            logger.warn(
                'VAPID keys are missing. Push notifications will not work.'
            );
        });
    } else {
        webpush.setVapidDetails(
            VAPID_EMAIL,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }
    globalThis.isPushInitialized = true;
}

const ALLOWED_PUSH_HOSTS = new Set([
    'fcm.googleapis.com',
    'android.googleapis.com',
    'updates.push.services.mozilla.com',
]);

const ALLOWED_PUSH_HOST_SUFFIXES = [
    '.push.apple.com',
    '.notify.windows.com',
    '.push.services.mozilla.com',
    '.push.samsungosp.com',
];

function isValidPushEndpoint(endpoint: string): boolean {
    if (!endpoint || typeof endpoint !== 'string') {
        return false;
    }
    try {
        const parsed = new URL(endpoint);
        if (parsed.protocol !== 'https:') {
            return false;
        }
        if (parsed.username || parsed.password || parsed.port) {
            return false;
        }
        const host = parsed.hostname.toLowerCase();
        if (ALLOWED_PUSH_HOSTS.has(host)) {
            return true;
        }
        return ALLOWED_PUSH_HOST_SUFFIXES.some(
            (suffix) => host.endsWith(suffix) && host.length > suffix.length
        );
    } catch {
        return false;
    }
}

export async function subscribeUser(sub: webpush.PushSubscription) {
    const session = await auth();
    if (!session) {
        unauthorized();
    }

    ensureWebPushInitialized();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Not authenticated');
    }

    if (!sub || !sub.endpoint || !sub.keys) {
        throw new Error('Invalid subscription object');
    }

    if (!isValidPushEndpoint(sub.endpoint)) {
        throw new Error('Invalid push subscription endpoint');
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
        after(() => {
            logger.error('Error saving subscription:', { error });
        });
        return { success: false, error: 'Failed to save subscription' };
    }
}

export async function unsubscribeUser(sub?: webpush.PushSubscription | null) {
    const session = await auth();
    if (!session) {
        unauthorized();
    }

    ensureWebPushInitialized();

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
        after(() => {
            logger.error('Error deleting subscription:', { error });
        });
        return { success: false, error: 'Failed to delete subscription' };
    }
}
