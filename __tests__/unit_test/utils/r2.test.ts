import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    isR2Url,
    extractR2Key,
    deleteFromR2,
    deleteMultipleFromR2,
} from '@/app/utils/r2';

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: vi.fn().mockImplementation(function (this: any) {
            this.send = mockSend;
        }),
        DeleteObjectCommand: vi.fn().mockImplementation(function (
            this: any,
            args: any
        ) {
            Object.assign(this, args);
        }),
        DeleteObjectsCommand: vi.fn().mockImplementation(function (
            this: any,
            args: any
        ) {
            Object.assign(this, args);
        }),
    };
});

describe('r2 utils', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = {
            ...originalEnv,
            R2_ACCOUNT_ID: 'test-account',
            R2_ACCESS_KEY_ID: 'test-access',
            R2_SECRET_ACCESS_KEY: 'test-secret',
            R2_BUCKET_NAME: 'test-bucket',
            R2_PUBLIC_DOMAIN: 'images.jorbites.com',
        };
    });

    describe('isR2Url', () => {
        it('should return true for valid R2 URLs', () => {
            expect(
                isR2Url(
                    'https://images.jorbites.com/remakes/1700000000-sample.webp'
                )
            ).toBe(true);
            expect(
                isR2Url(
                    'https://pub-4c3d704cf6de499a9ef3964908533212.r2.dev/remakes/sample.webp'
                )
            ).toBe(true);
            expect(
                isR2Url(
                    'https://account-id.r2.cloudflarestorage.com/remakes/sample.webp'
                )
            ).toBe(true);
            expect(isR2Url('remakes/1700000000-sample.webp')).toBe(true);
        });

        it('should return false for external non-R2 URLs', () => {
            expect(isR2Url('https://example.com/image.jpg')).toBe(false);
            expect(
                isR2Url(
                    'https://res.cloudinary.com/demo/image/upload/sample.jpg'
                )
            ).toBe(false);
        });

        it('should return false for empty or non-string inputs', () => {
            expect(isR2Url('')).toBe(false);
            // @ts-ignore
            expect(isR2Url(null)).toBe(false);
        });
    });

    describe('extractR2Key', () => {
        it('should extract key from full custom domain R2 URL', () => {
            expect(
                extractR2Key(
                    'https://images.jorbites.com/remakes/1700000000-sample.webp'
                )
            ).toBe('remakes/1700000000-sample.webp');
        });

        it('should extract key from r2.dev URL', () => {
            expect(
                extractR2Key(
                    'https://pub-4c3d704cf6de499a9ef3964908533212.r2.dev/remakes/photo1.webp'
                )
            ).toBe('remakes/photo1.webp');
        });

        it('should return key if already a relative key path', () => {
            expect(extractR2Key('remakes/photo1.webp')).toBe(
                'remakes/photo1.webp'
            );
        });

        it('should return null for empty string', () => {
            expect(extractR2Key('')).toBeNull();
        });
    });

    describe('deleteFromR2', () => {
        it('should delete object successfully', async () => {
            mockSend.mockResolvedValueOnce({});

            const result = await deleteFromR2(
                'https://images.jorbites.com/remakes/1700000000-sample.webp'
            );
            expect(result).toBe(true);
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should handle deletion error gracefully', async () => {
            mockSend.mockRejectedValueOnce(new Error('S3 deletion failed'));

            const result = await deleteFromR2(
                'https://images.jorbites.com/remakes/1700000000-sample.webp'
            );
            expect(result).toBe(false);
        });

        it('should return false for empty imageUrl', async () => {
            const result = await deleteFromR2('');
            expect(result).toBe(false);
        });
    });

    describe('deleteMultipleFromR2', () => {
        it('should delete multiple objects successfully', async () => {
            mockSend.mockResolvedValueOnce({});

            const result = await deleteMultipleFromR2([
                'https://images.jorbites.com/remakes/photo1.webp',
                'https://images.jorbites.com/remakes/photo2.webp',
            ]);
            expect(result).toBe(true);
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should return true for empty array', async () => {
            const result = await deleteMultipleFromR2([]);
            expect(result).toBe(true);
        });
    });
});
