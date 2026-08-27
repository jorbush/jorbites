import { describe, it, expect } from 'vitest';
import {
    generateDraftTitle,
    getDraftTTLInfo,
    getDraftProgress,
} from '@/app/lib/draftMetadata';
import { DraftSummary } from '@/app/types/draft';
import {
    DRAFT_TTL_SECONDS,
    SOLO_DRAFT_TTL_SECONDS,
} from '@/app/utils/constants';

describe('draftMetadata utility functions', () => {
    describe('generateDraftTitle', () => {
        it('returns custom title when title is provided', () => {
            const draft: DraftSummary = {
                draftId: 'd1',
                type: 'solo',
                title: 'Homemade Lasagna',
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe('Homemade Lasagna');
        });

        it('generates title from first category when title is empty', () => {
            const draft: DraftSummary = {
                draftId: 'd2',
                type: 'solo',
                title: '',
                categories: ['pasta', 'italian'],
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe('Untitled — Pasta');
        });

        it('generates title from ingredient count when title and categories are empty', () => {
            const draft: DraftSummary = {
                draftId: 'd3',
                type: 'solo',
                title: '   ',
                categories: [],
                ingredients: ['Flour', 'Water', 'Salt'],
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe('Untitled — 3 ingredients');
        });

        it('generates title from method when title, categories, and ingredients are empty', () => {
            const draft: DraftSummary = {
                draftId: 'd4',
                type: 'solo',
                title: '',
                categories: [],
                ingredients: [],
                method: 'bake',
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe('Untitled — Bake');
        });

        it('truncates long method string to 20 chars', () => {
            const draft: DraftSummary = {
                draftId: 'd5',
                type: 'solo',
                title: '',
                method: 'slow roast in a wood fire oven',
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe(
                'Untitled — Slow roast in a wood'
            );
        });

        it('falls back to "Untitled draft" when draft is completely empty', () => {
            const draft: DraftSummary = {
                draftId: 'd6',
                type: 'solo',
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            expect(generateDraftTitle(draft)).toBe('Untitled draft');
        });
    });

    describe('getDraftTTLInfo', () => {
        it('calculates remaining time for shared drafts (7 days TTL)', () => {
            const now = Date.now();
            // Updated 2 days ago
            const updatedAt = new Date(
                now - 2 * 24 * 3600 * 1000
            ).toISOString();
            const info = getDraftTTLInfo(updatedAt, 'shared');

            expect(info.isExpiringSoon).toBe(false);
            expect(info.label).toBe('Expires in 5 days');
            expect(info.remainingSeconds).toBeGreaterThan(4 * 24 * 3600);
        });

        it('flags warning when shared draft has less than 24 hours remaining', () => {
            const now = Date.now();
            // 6 days and 10 hours ago (14 hours left)
            const updatedAt = new Date(
                now - (6 * 24 + 10) * 3600 * 1000
            ).toISOString();
            const info = getDraftTTLInfo(updatedAt, 'shared');

            expect(info.isExpiringSoon).toBe(true);
            expect(info.label).toMatch(/Expires in 1[34] hours/);
        });

        it('flags warning when shared draft has less than 1 hour remaining', () => {
            const now = Date.now();
            // 6 days, 23 hours, 30 minutes ago (30 mins left)
            const updatedAt = new Date(
                now - (DRAFT_TTL_SECONDS - 1800) * 1000
            ).toISOString();
            const info = getDraftTTLInfo(updatedAt, 'shared');

            expect(info.isExpiringSoon).toBe(true);
            expect(info.label).toMatch(/Expires in 30 minutes/);
        });

        it('handles expired drafts correctly', () => {
            const now = Date.now();
            // 8 days ago
            const updatedAt = new Date(
                now - 8 * 24 * 3600 * 1000
            ).toISOString();
            const info = getDraftTTLInfo(updatedAt, 'shared');

            expect(info.isExpiringSoon).toBe(true);
            expect(info.label).toBe('Expired');
            expect(info.remainingSeconds).toBe(0);
        });

        it('calculates remaining time for solo drafts (360 days TTL)', () => {
            const now = Date.now();
            // Updated 10 days ago
            const updatedAt = new Date(
                now - 10 * 24 * 3600 * 1000
            ).toISOString();
            const info = getDraftTTLInfo(updatedAt, 'solo');

            expect(info.isExpiringSoon).toBe(false);
            expect(info.label).toMatch(/Expires in \d+ weeks/);
            expect(info.key).toBe('draft_time_weeks');
            expect(info.count).toBeGreaterThan(45);
            expect(info.remainingSeconds).toBeGreaterThan(340 * 24 * 3600);
        });

        it('handles undefined, null, and invalid dates without NaN', () => {
            const undefinedInfo = getDraftTTLInfo(undefined, 'solo');
            expect(undefinedInfo.label).not.toContain('NaN');
            expect(undefinedInfo.isExpiringSoon).toBe(false);
            expect(undefinedInfo.key).toBe('draft_time_weeks');
            expect(typeof undefinedInfo.count).toBe('number');
            expect(isNaN(undefinedInfo.count!)).toBe(false);

            const nullInfo = getDraftTTLInfo(null, 'shared');
            expect(nullInfo.label).not.toContain('NaN');
            expect(nullInfo.key).toBe('draft_time_weeks');
            expect(nullInfo.count).toBe(1);

            const invalidInfo = getDraftTTLInfo('not-a-date', 'solo');
            expect(invalidInfo.label).not.toContain('NaN');
            expect(isNaN(invalidInfo.remainingSeconds!)).toBe(false);
        });
    });

    describe('getDraftProgress', () => {
        it('calculates progress for completely empty draft (1 step completed because Related is optional)', () => {
            const draft: DraftSummary = {
                draftId: 'd1',
                type: 'solo',
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            const progress = getDraftProgress(draft);

            expect(progress.totalSteps).toBe(7);
            expect(progress.completedSteps).toBe(1); // Step 5 (Related) is always marked completed
            expect(progress.percentage).toBe(14); // 1/7 ~= 14%
            expect(progress.stepDetails.length).toBe(7);
        });

        it('calculates progress for partially filled draft', () => {
            const draft: DraftSummary = {
                draftId: 'd2',
                type: 'solo',
                categories: ['dessert'],
                title: 'Tiramisu',
                ingredients: ['Mascarpone', 'Coffee', 'Savoiardi'],
                ownerId: 'u1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            };
            const progress = getDraftProgress(draft);

            // Category (0), Description (1), Ingredients (2), Related (5) = 4 completed
            expect(progress.completedSteps).toBe(4);
            expect(progress.percentage).toBe(57); // 4/7 ~= 57%
            expect(progress.stepDetails[0].completed).toBe(true);
            expect(progress.stepDetails[1].completed).toBe(true);
            expect(progress.stepDetails[2].completed).toBe(true);
            expect(progress.stepDetails[3].completed).toBe(false); // Method
            expect(progress.stepDetails[4].completed).toBe(false); // Steps
            expect(progress.stepDetails[5].completed).toBe(true); // Related
            expect(progress.stepDetails[6].completed).toBe(false); // Images
        });

        it('calculates 100% progress for fully filled draft', () => {
            const draft: DraftSummary = {
                draftId: 'd3',
                type: 'shared',
                categories: ['dessert'],
                title: 'Tiramisu',
                ingredients: ['Mascarpone'],
                method: 'no-bake',
                steps: ['Mix', 'Layer', 'Chill'],
                imageSrc: 'https://cloudinary.com/img.jpg',
                ownerId: 'u1',
                coCooksIds: ['u2'],
                updatedAt: new Date().toISOString(),
            };
            const progress = getDraftProgress(draft);

            expect(progress.completedSteps).toBe(7);
            expect(progress.percentage).toBe(100);
            expect(progress.stepDetails.every((s) => s.completed)).toBe(true);
        });
    });
});
