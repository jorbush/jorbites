'use server';

import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';
import type {
    WeeklyChallenge,
    ChallengeType,
} from '@/app/lib/weekly-challenge';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { headers } from 'next/headers';

export type { WeeklyChallenge, ChallengeType };

/**
 * Gets the current active challenge. Read-only server action.
 */
export async function getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    // 1. Check for authenticated user session
    const currentUser = await getCurrentUser();
    if (currentUser) {
        return await getCurrentChallengeLib();
    }

    // 2. Check for CRON_SECRET authorization (for cron jobs)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = (await headers()).get('Authorization');

    if (cronSecret && authHeader) {
        const [scheme, token] = authHeader.trim().split(/\s+/);
        if (scheme.toLowerCase() === 'bearer' && token === cronSecret) {
            return await getCurrentChallengeLib();
        }
    }

    throw new Error('Unauthorized');
}
