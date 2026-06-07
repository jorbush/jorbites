import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    isCloudinaryUrl,
    extractPublicId,
    deleteFromCloudinary,
    deleteMultipleFromCloudinary
} from '@/app/utils/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Mock cloudinary
vi.mock('cloudinary', () => ({
    v2: {
        config: vi.fn(),
        uploader: {
            destroy: vi.fn(),
        },
    },
}));

describe('cloudinary utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isCloudinaryUrl', () => {
        it('should return true for valid cloudinary URLs', () => {
            expect(isCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe(true);
        });

        it('should return false for non-cloudinary URLs', () => {
            expect(isCloudinaryUrl('https://example.com/image.jpg')).toBe(false);
        });

        it('should return false for empty or non-string inputs', () => {
            expect(isCloudinaryUrl('')).toBe(false);
            // @ts-ignore
            expect(isCloudinaryUrl(null)).toBe(false);
        });
    });

    describe('extractPublicId', () => {
        it('should extract public_id from simple URL', () => {
            expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe('sample');
        });

        it('should extract public_id from URL with version', () => {
            expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/v123456789/sample.jpg')).toBe('sample');
        });

        it('should extract public_id from URL with transformations', () => {
            expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg')).toBe('sample');
        });

        it('should extract public_id from URL with folders', () => {
            expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/v1/folder/subfolder/sample.jpg')).toBe('folder/subfolder/sample');
        });

        it('should return null for non-cloudinary URLs', () => {
            expect(extractPublicId('https://example.com/image.jpg')).toBeNull();
        });
    });

    describe('deleteFromCloudinary', () => {
        it('should return true when cloudinary deletion is successful', async () => {
            vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

            const result = await deleteFromCloudinary('https://res.cloudinary.com/demo/image/upload/sample.jpg');

            expect(result).toBe(true);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('sample');
        });

        it('should return false when cloudinary deletion fails', async () => {
            vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'not found' });

            const result = await deleteFromCloudinary('https://res.cloudinary.com/demo/image/upload/sample.jpg');

            expect(result).toBe(false);
        });

        it('should return false when an error occurs', async () => {
            vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(new Error('Network error'));

            const result = await deleteFromCloudinary('https://res.cloudinary.com/demo/image/upload/sample.jpg');

            expect(result).toBe(false);
        });

        it('should work with public_id directly', async () => {
            vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

            const result = await deleteFromCloudinary('sample');

            expect(result).toBe(true);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('sample');
        });
    });

    describe('deleteMultipleFromCloudinary', () => {
        it('should delete multiple images and return results', async () => {
            vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

            const urls = [
                'https://res.cloudinary.com/demo/image/upload/img1.jpg',
                'https://res.cloudinary.com/demo/image/upload/img2.jpg'
            ];

            const result = await deleteMultipleFromCloudinary(urls);

            expect(result.successful).toHaveLength(2);
            expect(result.successful).toContain(urls[0]);
            expect(result.successful).toContain(urls[1]);
            expect(result.failed).toHaveLength(0);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
        });

        it('should handle partial failures', async () => {
            vi.mocked(cloudinary.uploader.destroy)
                .mockResolvedValueOnce({ result: 'ok' })
                .mockResolvedValueOnce({ result: 'error' });

            const urls = [
                'https://res.cloudinary.com/demo/image/upload/img1.jpg',
                'https://res.cloudinary.com/demo/image/upload/img2.jpg'
            ];

            const result = await deleteMultipleFromCloudinary(urls);

            expect(result.successful).toHaveLength(1);
            expect(result.successful).toContain(urls[0]);
            expect(result.failed).toHaveLength(1);
            expect(result.failed).toContain(urls[1]);
        });

        it('should handle non-cloudinary URLs by filtering them out', async () => {
            const urls = [
                'https://res.cloudinary.com/demo/image/upload/img1.jpg',
                'https://example.com/not-cloudinary.jpg'
            ];

            vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

            const result = await deleteMultipleFromCloudinary(urls);

            expect(result.successful).toHaveLength(1);
            expect(result.successful).toContain(urls[0]);
            expect(result.failed).toHaveLength(0);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
        });

        it('should return empty results for empty input', async () => {
            const result = await deleteMultipleFromCloudinary([]);
            expect(result.successful).toHaveLength(0);
            expect(result.failed).toHaveLength(0);
        });
    });
});
