import { expect } from '@jest/globals';
import { GET as ImageProxyGET } from '@/app/api/image-proxy/route';
import { NextRequest } from 'next/server';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Image Proxy API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/image-proxy', () => {
        it('should return 400 when URL parameter is missing', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/image-proxy'
            );

            const response = await ImageProxyGET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('URL parameter is required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when fetching image fails', async () => {
            const mockFetch = global.fetch as jest.Mock;
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            const request = new NextRequest(
                'http://localhost:3000/api/image-proxy?url=https://example.com/image.jpg'
            );

            const response = await ImageProxyGET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Failed to fetch image: Not Found');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 500 when fetch throws an error', async () => {
            const mockFetch = global.fetch as jest.Mock;
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const request = new NextRequest(
                'http://localhost:3000/api/image-proxy?url=https://example.com/image.jpg'
            );

            const response = await ImageProxyGET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to process image request');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });

        it('should process valid Cloudinary URL successfully', async () => {
            const mockImageData = new ArrayBuffer(1024);
            const mockFetch = global.fetch as jest.Mock;
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: {
                    get: jest.fn().mockReturnValue('image/jpeg'),
                },
                arrayBuffer: jest.fn().mockResolvedValueOnce(mockImageData),
            });

            const request = new NextRequest(
                'http://localhost:3000/api/image-proxy?url=https://res.cloudinary.com/test/image/upload/test.jpg&w=800&h=600'
            );

            const response = await ImageProxyGET(request);

            expect(response.status).toBe(200);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(
                    'f_auto,q_auto:good,w_800,h_600,c_fill'
                ),
                expect.any(Object)
            );
        });

        it('should process non-Cloudinary URL successfully', async () => {
            const mockImageData = new ArrayBuffer(1024);
            const mockFetch = global.fetch as jest.Mock;
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: {
                    get: jest.fn().mockReturnValue('image/png'),
                },
                arrayBuffer: jest.fn().mockResolvedValueOnce(mockImageData),
            });

            const request = new NextRequest(
                'http://localhost:3000/api/image-proxy?url=https://example.com/image.png'
            );

            const response = await ImageProxyGET(request);

            expect(response.status).toBe(200);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://example.com/image.png',
                expect.any(Object)
            );
        });
    });
});
