'use server';

import {
    fetchCurrentChallenge,
    WeeklyChallenge as WeeklyChallengeType,
} from '@/app/lib/weekly-challenge';

export type WeeklyChallenge = WeeklyChallengeType;

/**
 * Gets the current active challenge. Returns null if none exists.
 */
export async function getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    return fetchCurrentChallenge();
}
