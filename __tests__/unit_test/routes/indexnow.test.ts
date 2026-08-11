import { POST as IndexNowPOST } from '@/app/api/indexnow/route';
import { getSitemapData } from '@/app/sitemap';

jest.mock('@/app/sitemap', () => ({
    getSitemapData: jest.fn(),
}));

describe('POST /api/indexnow', () => {
    const originalSecret = process.env.INDEXNOW_SECRET;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.INDEXNOW_SECRET = 'secret-123';
        (global as any).fetch = jest.fn();
    });

    afterEach(() => {
        process.env.INDEXNOW_SECRET = originalSecret;
    });

    it('should return 401 when authorization header is invalid or missing', async () => {
        const request = new Request('http://localhost/api/indexnow', {
            method: 'POST',
            headers: { authorization: 'Bearer wrong-secret' },
        });

        const response = await IndexNowPOST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid or missing IndexNow secret');
    });

    it('should submit sitemap URLs to IndexNow successfully', async () => {
        jest.mocked(getSitemapData).mockResolvedValue([
            { url: 'https://jorbites.com/recipes/1' },
            { url: 'https://jorbites.com/recipes/2' },
        ] as any);

        jest.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
        } as any);

        const request = new Request('http://localhost/api/indexnow', {
            method: 'POST',
            headers: { authorization: 'Bearer secret-123' },
        });

        const response = await IndexNowPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            message: 'Successfully submitted URLs to IndexNow',
            count: 2,
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('https://jorbites.com/recipes/1'),
            })
        );
    });

    it('should handle failed IndexNow API responses', async () => {
        jest.mocked(getSitemapData).mockResolvedValue([]);
        jest.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 422,
            statusText: 'Unprocessable Entity',
        } as any);

        const request = new Request('http://localhost/api/indexnow', {
            method: 'POST',
            headers: { authorization: 'Bearer secret-123' },
        });

        const response = await IndexNowPOST(request);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.error).toContain('IndexNow submission failed');
    });

    it('should return 500 when an exception occurs', async () => {
        jest.mocked(getSitemapData).mockRejectedValue(
            new Error('Sitemap error')
        );

        const request = new Request('http://localhost/api/indexnow', {
            method: 'POST',
            headers: { authorization: 'Bearer secret-123' },
        });

        const response = await IndexNowPOST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
    });
});
