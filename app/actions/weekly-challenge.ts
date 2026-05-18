'use server';

import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';
import { SafeWeeklyChallenge } from '@/app/types';

/**
 * Gets the current active challenge. Read-only server action.
 */
export async function getCurrentChallenge(): Promise<SafeWeeklyChallenge | null> {
    const challenge = await getCurrentChallengeLib();
    if (!challenge) return null;

    return {
        ...challenge,
        startDate: challenge.startDate.toISOString(),
        endDate: challenge.endDate.toISOString(),
        createdAt: challenge.createdAt.toISOString(),
        updatedAt: challenge.updatedAt.toISOString(),
    };
}
