import { describe, it, expect } from 'vitest';
import {
    isValidYouTubeUrl,
    validateYouTubeUrl,
    YOUTUBE_URL_REGEX,
} from '@/app/utils/validation';

describe('YouTube URL Validation', () => {
    describe('YOUTUBE_URL_REGEX', () => {
        it('should match valid YouTube URLs', () => {
            const validUrls = [
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'https://youtube.com/watch?v=dQw4w9WgXcQ',
                'https://youtu.be/dQw4w9WgXcQ',
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmRdnEQy',
                'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'http://youtu.be/dQw4w9WgXcQ',
                'https://youtube.com/shorts/IoB4GSxUidI',
            ];

            validUrls.forEach((url) => {
                expect(YOUTUBE_URL_REGEX.test(url)).toBe(true);
            });
        });

        it('should not match invalid URLs', () => {
            const invalidUrls = [
                'https://vimeo.com/123456789',
                'https://example.com/video',
                'not-a-url',
                'youtube.com/watch?v=dQw4w9WgXcQ', // Missing protocol
                'https://youtube.com/watch?v=', // Missing video ID
                'https://youtu.be/', // Missing video ID
                'ftp://youtube.com/watch?v=dQw4w9WgXcQ',
            ];

            invalidUrls.forEach((url) => {
                expect(YOUTUBE_URL_REGEX.test(url)).toBe(false);
            });
        });
    });

    describe('isValidYouTubeUrl', () => {
        it('should return true for valid YouTube URLs', () => {
            const validUrls = [
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'https://youtu.be/dQw4w9WgXcQ',
                '  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ', // With whitespace
            ];

            validUrls.forEach((url) => {
                expect(isValidYouTubeUrl(url)).toBe(true);
            });
        });

        it('should return true for empty URLs', () => {
            expect(isValidYouTubeUrl('')).toBe(true);
            expect(isValidYouTubeUrl('   ')).toBe(true);
        });

        it('should return false for invalid URLs', () => {
            const invalidUrls = [
                'https://vimeo.com/123456789',
                'not-a-url',
                'https://youtube.com/watch?v=',
            ];

            invalidUrls.forEach((url) => {
                expect(isValidYouTubeUrl(url)).toBe(false);
            });
        });
    });

    describe('validateYouTubeUrl', () => {
        it('should return true for valid YouTube URLs', () => {
            const validUrls = [
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'https://youtu.be/dQw4w9WgXcQ',
            ];

            validUrls.forEach((url) => {
                expect(validateYouTubeUrl(url)).toBe(true);
            });
        });

        it('should return true for empty URLs', () => {
            expect(validateYouTubeUrl('')).toBe(true);
            expect(validateYouTubeUrl('   ')).toBe(true);
        });

        it('should return default error message for invalid URLs', () => {
            const invalidUrls = [
                'https://vimeo.com/123456789',
                'not-a-url',
                'https://youtube.com/watch?v=',
            ];

            const expectedMessage =
                'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)';

            invalidUrls.forEach((url) => {
                expect(validateYouTubeUrl(url)).toBe(expectedMessage);
            });
        });

        it('should return custom error message when provided', () => {
            const customMessage = 'URL de YouTube inválida';
            const invalidUrl = 'https://vimeo.com/123456789';

            expect(validateYouTubeUrl(invalidUrl, customMessage)).toBe(
                customMessage
            );
        });

        it('should return custom error message for valid URLs even with custom message', () => {
            const customMessage = 'URL de YouTube inválida';
            const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

            expect(validateYouTubeUrl(validUrl, customMessage)).toBe(true);
        });
    });
});
