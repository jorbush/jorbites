import { expect } from '@jest/globals';

jest.unmock('@/app/utils/cloudinary');
jest.unmock('@/app/utils/r2');

const mockDeleteResourcesByPrefix = jest.fn();
const mockDeleteFolder = jest.fn();

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            destroy: jest.fn(),
        },
        api: {
            delete_resources_by_prefix: (...args: unknown[]) =>
                mockDeleteResourcesByPrefix(...args),
            delete_folder: (...args: unknown[]) => mockDeleteFolder(...args),
        },
    },
}));

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: (...args: unknown[]) => mockS3Send(...args),
    })),
    DeleteObjectCommand: jest.fn().mockImplementation((params) => ({
        __type: 'DeleteObjectCommand',
        params,
    })),
    DeleteObjectsCommand: jest.fn().mockImplementation((params) => ({
        __type: 'DeleteObjectsCommand',
        params,
    })),
    ListObjectsV2Command: jest.fn().mockImplementation((params) => ({
        __type: 'ListObjectsV2Command',
        params,
    })),
}));

import { deleteUserPrefixFromCloudinary } from '@/app/utils/cloudinary';
import { deleteUserPrefixFromR2 } from '@/app/utils/r2';

describe('Prefix Media Cleanup Helpers', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud',
            CLOUDINARY_API_KEY: 'test-key',
            CLOUDINARY_API_SECRET: 'test-secret',
            R2_ACCOUNT_ID: 'acc-123',
            R2_ACCESS_KEY_ID: 'key-123',
            R2_SECRET_ACCESS_KEY: 'secret-123',
            R2_BUCKET_NAME: 'jorbites-remakes',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('deleteUserPrefixFromCloudinary', () => {
        it('rejects unsafe userId containing slashes or traversal characters', async () => {
            const result = await deleteUserPrefixFromCloudinary('../all');
            expect(result.completed).toBe(false);
            expect(result.error).toContain('Invalid userId');
            expect(mockDeleteResourcesByPrefix).not.toHaveBeenCalled();
        });

        it('deletes user prefix and removes empty user folder', async () => {
            mockDeleteResourcesByPrefix.mockResolvedValueOnce({
                deleted: {
                    'users/user123/a': 'deleted',
                    'users/user123/b': 'deleted',
                },
                partial: false,
            });
            mockDeleteFolder.mockResolvedValueOnce({});

            const result = await deleteUserPrefixFromCloudinary('user123');

            expect(result).toEqual({ completed: true, deletedCount: 2 });
            expect(mockDeleteResourcesByPrefix).toHaveBeenCalledWith(
                'users/user123/',
                {
                    resource_type: 'image',
                    type: 'upload',
                    max_results: 500,
                }
            );
            expect(mockDeleteFolder).toHaveBeenCalledWith('users/user123');
        });

        it('loops on partial=true and caps at 5 pages per run', async () => {
            mockDeleteResourcesByPrefix.mockResolvedValue({
                deleted: { 'users/biguser/img': 'deleted' },
                partial: true,
            });

            const result = await deleteUserPrefixFromCloudinary('biguser');

            expect(mockDeleteResourcesByPrefix).toHaveBeenCalledTimes(5);
            expect(result).toEqual({ completed: false, deletedCount: 5 });
            expect(mockDeleteFolder).not.toHaveBeenCalled();
        });

        it('returns error in production when credentials are missing', async () => {
            process.env.ENV = 'production';
            delete process.env.CLOUDINARY_API_SECRET;

            const result = await deleteUserPrefixFromCloudinary('user123');
            expect(result.completed).toBe(false);
            expect(result.error).toContain('Missing Cloudinary credentials');
        });
    });

    describe('deleteUserPrefixFromR2', () => {
        it('rejects unsafe userId containing slashes or traversal characters', async () => {
            const result = await deleteUserPrefixFromR2('user/../../other');
            expect(result.completed).toBe(false);
            expect(result.error).toContain('Invalid userId');
            expect(mockS3Send).not.toHaveBeenCalled();
        });

        it('lists and batch-deletes all objects under remakes/<userId>/', async () => {
            mockS3Send
                .mockResolvedValueOnce({
                    Contents: [
                        { Key: 'remakes/user123/1.webp' },
                        { Key: 'remakes/user123/2.webp' },
                    ],
                    IsTruncated: false,
                })
                .mockResolvedValueOnce({ Errors: [] });

            const result = await deleteUserPrefixFromR2('user123');

            expect(result).toEqual({ completed: true, deletedCount: 2 });
            expect(mockS3Send).toHaveBeenNthCalledWith(1, {
                __type: 'ListObjectsV2Command',
                params: {
                    Bucket: 'jorbites-remakes',
                    Prefix: 'remakes/user123/',
                    MaxKeys: 1000,
                },
            });
            expect(mockS3Send).toHaveBeenNthCalledWith(2, {
                __type: 'DeleteObjectsCommand',
                params: {
                    Bucket: 'jorbites-remakes',
                    Delete: {
                        Objects: [
                            { Key: 'remakes/user123/1.webp' },
                            { Key: 'remakes/user123/2.webp' },
                        ],
                        Quiet: true,
                    },
                },
            });
        });

        it('handles R2 batch deletion errors and returns completed: false', async () => {
            mockS3Send
                .mockResolvedValueOnce({
                    Contents: [
                        { Key: 'remakes/user123/1.webp' },
                        { Key: 'remakes/user123/2.webp' },
                    ],
                    IsTruncated: false,
                })
                .mockResolvedValueOnce({
                    Errors: [{ Code: 'InternalError', Message: 'R2 error' }],
                });

            const result = await deleteUserPrefixFromR2('user123');

            expect(result).toEqual({
                completed: false,
                deletedCount: 1,
                error: 'R2 error',
            });
        });

        it('returns completed: false when more than 5 pages exist', async () => {
            mockS3Send.mockImplementation((cmd: { __type: string }) => {
                if (cmd.__type === 'ListObjectsV2Command') {
                    return Promise.resolve({
                        Contents: [{ Key: 'remakes/hugeuser/img.webp' }],
                        IsTruncated: true,
                        NextContinuationToken: 'next-token',
                    });
                }
                return Promise.resolve({ Errors: [] });
            });

            const result = await deleteUserPrefixFromR2('hugeuser');

            expect(result).toEqual({ completed: false, deletedCount: 5 });
            expect(mockS3Send).toHaveBeenCalledTimes(10); // 5 list + 5 delete
        });
    });
});
