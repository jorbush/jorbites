import { describe, it, expect } from 'vitest';
import {
    formatStatNumber,
    calculateTrend,
    calculateCookingTimeInHours,
    calculateThisYearPercentage,
    resolvePreferenceDisplay,
    capitalize,
} from '@/app/components/stats/userStatsUtils';

describe('userStatsUtils', () => {
    describe('formatStatNumber', () => {
        it('formats numbers under 1000 without changes', () => {
            expect(formatStatNumber(0)).toBe(0);
            expect(formatStatNumber(42)).toBe(42);
            expect(formatStatNumber(999)).toBe(999);
        });

        it('formats numbers 1000 or greater with k suffix', () => {
            expect(formatStatNumber(1000)).toBe('1k');
            expect(formatStatNumber(1250)).toBe('1.3k');
            expect(formatStatNumber(1200)).toBe('1.2k');
            expect(formatStatNumber(10500)).toBe('10.5k');
        });
    });

    describe('calculateTrend', () => {
        it('returns 0 when recipeCount is 0 or negative', () => {
            expect(calculateTrend(5, 0)).toBe(0);
            expect(calculateTrend(5, -1)).toBe(0);
        });

        it('calculates the percentage rounded correctly', () => {
            expect(calculateTrend(1, 4)).toBe(25);
            expect(calculateTrend(1, 3)).toBe(33);
            expect(calculateTrend(2, 3)).toBe(67);
            expect(calculateTrend(10, 10)).toBe(100);
        });
    });

    describe('calculateCookingTimeInHours', () => {
        it('returns 0 when totalMinutes is missing or 0', () => {
            expect(calculateCookingTimeInHours(0)).toBe(0);
            expect(calculateCookingTimeInHours(null)).toBe(0);
            expect(calculateCookingTimeInHours(undefined)).toBe(0);
        });

        it('converts minutes to hours rounded to 1 decimal place', () => {
            expect(calculateCookingTimeInHours(60)).toBe(1);
            expect(calculateCookingTimeInHours(90)).toBe(1.5);
            expect(calculateCookingTimeInHours(45)).toBe(0.8);
            expect(calculateCookingTimeInHours(125)).toBe(2.1);
        });
    });

    describe('calculateThisYearPercentage', () => {
        it('calculates percentage of recipes this year', () => {
            expect(calculateThisYearPercentage(5, 10)).toBe(50);
            expect(calculateThisYearPercentage(1, 3)).toBe(33);
        });

        it('handles 0 recipes gracefully without dividing by zero', () => {
            expect(calculateThisYearPercentage(0, 0)).toBe(0);
        });
    });

    describe('resolvePreferenceDisplay', () => {
        it('returns hyphen when value is missing', () => {
            expect(resolvePreferenceDisplay(undefined, (k) => k)).toBe('-');
            expect(resolvePreferenceDisplay(null, (k) => k)).toBe('-');
            expect(resolvePreferenceDisplay('', (k) => k)).toBe('-');
        });

        it('translates value if translation exists', () => {
            const mockTranslate = (key: string) =>
                key === 'dessert' ? 'Postre' : '';
            expect(resolvePreferenceDisplay('Dessert', mockTranslate)).toBe(
                'Postre'
            );
        });

        it('falls back to raw value if translation returns empty', () => {
            const mockTranslate = () => '';
            expect(resolvePreferenceDisplay('Baking', mockTranslate)).toBe(
                'Baking'
            );
        });
    });

    describe('capitalize', () => {
        it('returns empty string when given empty string', () => {
            expect(capitalize('')).toBe('');
        });

        it('capitalizes the first character', () => {
            expect(capitalize('this year')).toBe('This year');
            expect(capitalize('recipes')).toBe('Recipes');
        });
    });
});
