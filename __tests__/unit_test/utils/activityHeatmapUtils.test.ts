import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    getActivityDayColor,
    formatLocalDateKey,
    toDateKey,
    useActivityCalendar,
} from '@/app/utils/activityHeatmapUtils';

describe('activityHeatmapUtils', () => {
    describe('getActivityDayColor', () => {
        it('returns correct class for each level', () => {
            expect(getActivityDayColor(0)).toBe(
                'bg-neutral-100 dark:bg-neutral-800'
            );
            expect(getActivityDayColor(1)).toBe(
                'bg-green-450/30 dark:bg-green-450/20'
            );
            expect(getActivityDayColor(2)).toBe(
                'bg-green-450/50 dark:bg-green-450/40'
            );
            expect(getActivityDayColor(3)).toBe(
                'bg-green-450/70 dark:bg-green-450/60'
            );
            expect(getActivityDayColor(4)).toBe(
                'bg-green-450 dark:bg-green-450'
            );
            expect(getActivityDayColor(5)).toBe(
                'bg-neutral-100 dark:bg-neutral-800'
            );
        });
    });

    describe('formatLocalDateKey', () => {
        it('formats Date to YYYY-MM-DD using local time', () => {
            const date = new Date(2026, 4, 9); // May 9, 2026
            expect(formatLocalDateKey(date)).toBe('2026-05-09');
        });
    });

    describe('toDateKey', () => {
        it('returns null for null, undefined, or invalid date', () => {
            expect(toDateKey(null)).toBeNull();
            expect(toDateKey(undefined)).toBeNull();
            expect(toDateKey('invalid-date')).toBeNull();
        });

        it('returns valid local date key for date string', () => {
            const d = new Date(2026, 0, 15);
            expect(toDateKey(d.toISOString())).toBe(formatLocalDateKey(d));
        });
    });

    describe('useActivityCalendar', () => {
        it('computes 53 weeks of activity and counts', () => {
            const now = new Date();
            const { result } = renderHook(() =>
                useActivityCalendar(
                    [{ id: 'r1', createdAt: now.toISOString(), questId: 'q1' }],
                    [
                        {
                            id: 'c1',
                            createdAt: now.toISOString(),
                            isCooked: true,
                        },
                    ],
                    [],
                    [{ date: now.toISOString(), type: 'recipe', count: 1 }],
                    'en'
                )
            );

            expect(result.current.weeks.length).toBeGreaterThanOrEqual(52);
            expect(result.current.totalActivities).toBe(3);
            expect(result.current.monthLabels.length).toBeGreaterThan(0);
        });
    });
});
