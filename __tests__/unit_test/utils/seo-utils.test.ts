import { describe, it, expect } from 'vitest';
import { formatIsoDuration, createOGImageUrl } from '@/app/utils/seo-utils';

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

describe('createOGImageUrl', () => {
    it('returns default fallback image when url is empty or null', () => {
        expect(createOGImageUrl(null)).toBe('/jorbites-social.jpg');
        expect(createOGImageUrl(undefined)).toBe('/jorbites-social.jpg');
        expect(createOGImageUrl('')).toBe('/jorbites-social.jpg');
    });

    it('returns original url if not a Cloudinary url', () => {
        expect(createOGImageUrl('https://example.com/test.jpg')).toBe(
            'https://example.com/test.jpg'
        );
    });

    it('transforms Cloudinary url with OpenGraph specs', () => {
        const url =
            'https://res.cloudinary.com/demo/image/upload/v1234567890/recipe.jpg';
        const expected =
            'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/recipe.jpg';
        expect(createOGImageUrl(url)).toBe(expected);
    });

    it('replaces existing transformations in Cloudinary url', () => {
        const url =
            'https://res.cloudinary.com/demo/image/upload/w_500,h_500/v1234567890/recipe.jpg';
        const expected =
            'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/v1234567890/recipe.jpg';
        expect(createOGImageUrl(url)).toBe(expected);
    });
});
