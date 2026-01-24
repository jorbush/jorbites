import { describe, expect, it } from 'vitest';
import { getHighResImageUrl, getYoutubeVideoId } from '@/app/utils/seo-utils';

describe('seo-utils', () => {
    describe('getHighResImageUrl', () => {
        it('should return empty string if url is undefined', () => {
            expect(getHighResImageUrl(undefined)).toBe('');
        });

        it('should return url as is if not from cloudinary', () => {
            const url = 'https://example.com/image.jpg';
            expect(getHighResImageUrl(url)).toBe(url);
        });

        it('should transform standard cloudinary url', () => {
            const url =
                'https://res.cloudinary.com/demo/image/upload/sample.jpg';
            const expected =
                'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/sample.jpg';
            expect(getHighResImageUrl(url)).toBe(expected);
        });

        it('should transform cloudinary url with version', () => {
            const url =
                'https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg';
            const expected =
                'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/v12345/sample.jpg';
            expect(getHighResImageUrl(url)).toBe(expected);
        });

        it('should transform cloudinary url with existing transformations (replacing them)', () => {
            // In current logic: "If it's transformations (e.g. w_800,h_600), we discard it"
            // input: .../upload/w_800/sample.jpg
            // output: .../upload/w_1200,h_900,c_fill,q_auto:good/sample.jpg
            const url =
                'https://res.cloudinary.com/demo/image/upload/w_800/sample.jpg';
            // The regex capture groups are:
            // 1: https://res.cloudinary.com/demo
            // 2: w_800 (segment)
            // 3: sample.jpg (imagePath)
            // Logic: isVersion check on 'w_800' -> false. fullPath = imagePath = sample.jpg.
            const expected =
                'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/sample.jpg';
            expect(getHighResImageUrl(url)).toBe(expected);
        });
    });

    describe('getYoutubeVideoId', () => {
        it('should return null for empty input', () => {
            expect(getYoutubeVideoId('')).toBeNull();
        });

        it('should return ID when input is just the ID', () => {
            expect(getYoutubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        });

        it('should return ID from standard youtube.com watch url', () => {
            expect(
                getYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ).toBe('dQw4w9WgXcQ');
        });

        it('should return ID from youtube.com embed url', () => {
            expect(
                getYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')
            ).toBe('dQw4w9WgXcQ');
        });

        it('should return ID from youtube.com/v/ url', () => {
            expect(
                getYoutubeVideoId('https://www.youtube.com/v/dQw4w9WgXcQ')
            ).toBe('dQw4w9WgXcQ');
        });

        it('should return ID from youtube.com/shorts/ url', () => {
            expect(
                getYoutubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')
            ).toBe('dQw4w9WgXcQ');
        });

        it('should return ID from youtu.be short url', () => {
            expect(getYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
                'dQw4w9WgXcQ'
            );
        });

        it('should return ID from mobile youtube url', () => {
            expect(
                getYoutubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')
            ).toBe('dQw4w9WgXcQ');
        });

        it('should return null for invalid urls', () => {
            expect(getYoutubeVideoId('https://example.com')).toBeNull();
        });

        it('should return null if ID length is incorrect', () => {
            // standard IDs are 11 chars
            expect(getYoutubeVideoId('https://youtu.be/tooShort')).toBeNull();
        });
    });
});
