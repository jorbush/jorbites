import { expect } from '@jest/globals';
import { POST as UploadR2POST } from '@/app/api/upload/r2/route';

let mockCurrentUser: { id: string; name?: string; email?: string } | null =
    null;

jest.mock('@/app/actions/getCurrentUser', () =>
    jest.fn(() => Promise.resolve(mockCurrentUser))
);

jest.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: jest.fn().mockImplementation(() => ({})),
        PutObjectCommand: jest.fn().mockImplementation((params) => params),
    };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
    return {
        getSignedUrl: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve(
                    'https://mock-r2-upload-url.cloudflarestorage.com/remakes/test.webp?signature=123'
                )
            ),
    };
});

describe('Cloudflare R2 Upload API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentUser = null;
    });

    it('should return 401 when user is not authenticated', async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({
                filename: 'photo.webp',
                contentType: 'image/webp',
            }),
        } as unknown as Request;

        const response = await UploadR2POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('User authentication required to upload image');
    });

    it('should return 400 when filename is missing', async () => {
        mockCurrentUser = { id: 'user-123', name: 'Tester' };

        const mockRequest = {
            json: jest.fn().mockResolvedValue({
                contentType: 'image/webp',
            }),
        } as unknown as Request;

        const response = await UploadR2POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Filename is required');
    });

    it('should return 400 when contentType is not an image', async () => {
        mockCurrentUser = { id: 'user-123', name: 'Tester' };

        const mockRequest = {
            json: jest.fn().mockResolvedValue({
                filename: 'document.pdf',
                contentType: 'application/pdf',
            }),
        } as unknown as Request;

        const response = await UploadR2POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Invalid content type. Only image files are allowed.'
        );
    });

    it('should return presigned uploadUrl and publicUrl for authenticated users', async () => {
        mockCurrentUser = { id: 'user-123', name: 'Tester' };

        const mockRequest = {
            json: jest.fn().mockResolvedValue({
                filename: 'remake.png',
                contentType: 'image/png',
            }),
        } as unknown as Request;

        const response = await UploadR2POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.uploadUrl).toBeDefined();
        expect(data.publicUrl).toBeDefined();
        expect(data.key).toContain('remakes/');
    });
});
