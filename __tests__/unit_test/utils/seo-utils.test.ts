import { describe, it, expect } from 'vitest';
import { formatIsoDuration } from '@/app/utils/seo-utils';

describe('formatIsoDuration', () => {
    it('returns undefined for invalid or zero/negative input', () => {
        expect(formatIsoDuration(undefined)).toBeUndefined();
        expect(formatIsoDuration(null)).toBeUndefined();
        expect(formatIsoDuration(0)).toBeUndefined();
        expect(formatIsoDuration(-10)).toBeUndefined();
        expect(formatIsoDuration(NaN)).toBeUndefined();
    });

    it('formats minutes less than 60 correctly', () => {
        expect(formatIsoDuration(1)).toBe('PT1M');
        expect(formatIsoDuration(15)).toBe('PT15M');
        expect(formatIsoDuration(45)).toBe('PT45M');
    });

    it('formats exact hours correctly', () => {
        expect(formatIsoDuration(60)).toBe('PT1H');
        expect(formatIsoDuration(120)).toBe('PT2H');
    });

    it('formats combinations of hours and minutes correctly', () => {
        expect(formatIsoDuration(75)).toBe('PT1H15M');
        expect(formatIsoDuration(150)).toBe('PT2H30M');
        expect(formatIsoDuration(1440)).toBe('PT24H');
    });
});
