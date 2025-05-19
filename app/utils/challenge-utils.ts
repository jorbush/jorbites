import { isBefore } from 'date-fns';
import { WeeklyChallenge } from '@/app/actions/weekly-challenge';

export function isChallengeActive(challenge: WeeklyChallenge): boolean {
    return isBefore(new Date(), challenge.endDate);
}
