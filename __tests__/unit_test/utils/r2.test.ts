import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getR2Config,
    isR2Url,
    extractR2Key,
    extractR2KeyOwner,
    deleteFromR2,
    deleteMultipleFromR2,
    isValidR2Url,
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
        it('should return true for owned R2 URLs and relative remakes keys', () => {
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
                    'https://test-account.r2.cloudflarestorage.com/remakes/sample.webp'
                )
            ).toBe(true);
            expect(isR2Url('remakes/1700000000-sample.webp')).toBe(true);
        });

        it('should return false for third-party r2.dev or foreign account domains', () => {
            expect(
                isR2Url('https://pub-attacker.r2.dev/remakes/sample.webp')
            ).toBe(false);
            expect(
                isR2Url(
                    'https://foreign-account.r2.cloudflarestorage.com/remakes/sample.webp'
                )
            ).toBe(false);
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

    describe('isValidR2Url', () => {
        it('should return URL for valid R2 custom domain', () => {
            const url = 'https://images.jorbites.com/remakes/photo.webp';
            expect(isValidR2Url(url)).toBe(url);
        });

        it('should return URL for owned Jorbites r2.dev bucket domain', () => {
            const url =
                'https://pub-4c3d704cf6de499a9ef3964908533212.r2.dev/remakes/photo.webp';
            expect(isValidR2Url(url)).toBe(url);
        });

        it('should reject arbitrary third-party r2.dev domains', () => {
            const url = 'https://pub-attacker-bucket.r2.dev/remakes/photo.webp';
            expect(isValidR2Url(url)).toBeNull();
        });

        it('should return URL for configured account r2.cloudflarestorage.com domain', () => {
            const url =
                'https://test-account.r2.cloudflarestorage.com/remakes/photo.webp';
            expect(isValidR2Url(url)).toBe(url);
        });

        it('should reject foreign r2.cloudflarestorage.com domains', () => {
            const url =
                'https://other-account.r2.cloudflarestorage.com/remakes/photo.webp';
            expect(isValidR2Url(url)).toBeNull();
        });

        it('should return URL for Cloudinary domain', () => {
            const url =
                'https://res.cloudinary.com/demo/image/upload/sample.jpg';
            expect(isValidR2Url(url)).toBe(url);
        });

        it('should return null for non-allowed external URLs', () => {
            expect(isValidR2Url('https://example.com/evil.jpg')).toBeNull();
            expect(
                isValidR2Url('https://attacker.site.com/photo.png')
            ).toBeNull();
        });

        it('should return null for invalid URL strings or non-string inputs', () => {
            expect(isValidR2Url('')).toBeNull();
            expect(isValidR2Url('not-a-url')).toBeNull();
            expect(isValidR2Url(null)).toBeNull();
            expect(isValidR2Url(undefined)).toBeNull();
            expect(isValidR2Url(12345)).toBeNull();
        });

        it('should return null for non-http(s) protocols', () => {
            expect(isValidR2Url('javascript:alert(1)')).toBeNull();
            expect(isValidR2Url('data:image/png;base64,abc')).toBeNull();
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

        it('should refuse to delete non-R2 URLs such as Cloudinary URLs', async () => {
            const result = await deleteFromR2(
                'https://res.cloudinary.com/demo/image/upload/remakes/sample.jpg'
            );
            expect(result).toBe(false);
            expect(mockSend).not.toHaveBeenCalled();
        });
    });

    describe('extractR2KeyOwner', () => {
        it('should extract ownerId from user-namespaced keys', () => {
            expect(
                extractR2KeyOwner(
                    'https://images.jorbites.com/remakes/user-42/1700000000-abc.webp'
                )
            ).toBe('user-42');
        });

        it('should return null for legacy flat keys', () => {
            expect(
                extractR2KeyOwner(
                    'https://images.jorbites.com/remakes/1700000000-abc.webp'
                )
            ).toBeNull();
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

    describe('emulator configuration and port-aware public domain', () => {
        it('returns default R2 configuration when optional emulator env vars are unset', () => {
            delete process.env.R2_ENDPOINT;
            delete process.env.R2_REGION;
            delete process.env.R2_FORCE_PATH_STYLE;

            const config = getR2Config();
            expect(config.endpoint).toBe(
                'https://test-account.r2.cloudflarestorage.com'
            );
            expect(config.region).toBe('auto');
            expect(config.forcePathStyle).toBe(false);
        });

        it('uses R2_ENDPOINT, R2_REGION, and defaults forcePathStyle to true when R2_ENDPOINT is set', () => {
            process.env.R2_ENDPOINT = 'http://127.0.0.1:9298';
            process.env.R2_REGION = 'us-east-1';

            const config = getR2Config();
            expect(config.endpoint).toBe('http://127.0.0.1:9298');
            expect(config.region).toBe('us-east-1');
            expect(config.forcePathStyle).toBe(true);
        });

        it('matches R2_PUBLIC_DOMAIN with scheme and port and rejects mismatched ports', () => {
            process.env.R2_PUBLIC_DOMAIN = 'http://127.0.0.1:9298';

            const validEmulatorUrl =
                'http://127.0.0.1:9298/remakes/1700000000-sample.webp';
            const wrongPortUrl =
                'http://127.0.0.1:9999/remakes/1700000000-sample.webp';

            expect(isValidR2Url(validEmulatorUrl)).toBe(validEmulatorUrl);
            expect(isR2Url(validEmulatorUrl)).toBe(true);
            expect(extractR2Key(validEmulatorUrl)).toBe(
                'remakes/1700000000-sample.webp'
            );

            expect(isValidR2Url(wrongPortUrl)).toBeNull();
            expect(isR2Url(wrongPortUrl)).toBe(false);
        });
    });
});
