import { expect } from '@jest/globals';
import { POST as CloudinarySignPOST } from '@/app/api/upload/cloudinary-sign/route';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('cloudinary', () => ({
    v2: {
        utils: {
            api_sign_request: jest.fn(() => 'signed-hash-abc123'),
        },
    },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('POST /api/upload/cloudinary-sign', () => {
    const originalSecret = process.env.CLOUDINARY_API_SECRET;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CLOUDINARY_API_SECRET = 'test-cloudinary-secret';
    });

    afterEach(() => {
        process.env.CLOUDINARY_API_SECRET = originalSecret;
    });

    it('returns 401 when unauthenticated', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);

        const req = new Request('http://localhost/api/upload/cloudinary-sign', {
            method: 'POST',
            body: JSON.stringify({
                paramsToSign: { timestamp: 1700000000, folder: 'users/u1' },
            }),
        });

        const res = await CloudinarySignPOST(req);
        expect(res.status).toBe(401);
    });

    it('returns 500 when CLOUDINARY_API_SECRET is missing', async () => {
        delete process.env.CLOUDINARY_API_SECRET;
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);

        const req = new Request('http://localhost/api/upload/cloudinary-sign', {
            method: 'POST',
            body: JSON.stringify({
                paramsToSign: { timestamp: 1700000000, folder: 'users/u1' },
            }),
        });

        const res = await CloudinarySignPOST(req);
        expect(res.status).toBe(500);
    });

    it('returns 403 when folder targets another user or is missing', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);

        for (const badFolder of ['users/victim-2', 'other', undefined]) {
            const req = new Request(
                'http://localhost/api/upload/cloudinary-sign',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        paramsToSign: {
                            timestamp: 1700000000,
                            ...(badFolder ? { folder: badFolder } : {}),
                        },
                    }),
                }
            );

            const res = await CloudinarySignPOST(req);
            expect(res.status).toBe(403);
        }
        expect(cloudinary.utils.api_sign_request).not.toHaveBeenCalled();
    });

    it('returns 400 when disallowed params like public_id or overwrite are supplied', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);

        const req = new Request('http://localhost/api/upload/cloudinary-sign', {
            method: 'POST',
            body: JSON.stringify({
                paramsToSign: {
                    timestamp: 1700000000,
                    folder: 'users/u1',
                    public_id: '../victim',
                },
            }),
        });

        const res = await CloudinarySignPOST(req);
        expect(res.status).toBe(400);
        expect(cloudinary.utils.api_sign_request).not.toHaveBeenCalled();
    });

    it('signs valid params targeting the authenticated user folder', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);

        const req = new Request('http://localhost/api/upload/cloudinary-sign', {
            method: 'POST',
            body: JSON.stringify({
                paramsToSign: {
                    timestamp: 1700000000,
                    source: 'uw',
                    folder: 'users/u1',
                },
            }),
        });

        const res = await CloudinarySignPOST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ signature: 'signed-hash-abc123' });
        expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(
            {
                timestamp: 1700000000,
                source: 'uw',
                folder: 'users/u1',
            },
            'test-cloudinary-secret'
        );
    });
});
