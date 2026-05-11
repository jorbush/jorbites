'use server';

import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';
import type { WeeklyChallenge, ChallengeType } from '@/app/lib/weekly-challenge';

export type { WeeklyChallenge, ChallengeType };

/**
 * Gets the current active challenge. Read-only server action.
 */
export async function getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    return await getCurrentChallengeLib();
}
