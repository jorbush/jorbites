import { expect } from '@jest/globals';
import { GET as ImageProxyGET } from '@/app/api/image-proxy/route';
import { NextRequest } from 'next/server';

// Mock fetch for testing
global.fetch = jest.fn();

describe('GET /api/image-proxy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    it('should return 400 when domain is not allowed', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://example.com/image.jpg'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('URL domain not allowed');
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should block SSRF attempts targeting cloud metadata', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=http://169.254.169.254/latest/meta-data/'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('URL domain not allowed');
    });

    it('should block SSRF attempts targeting localhost', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=http://localhost:3000/api/secret'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('URL domain not allowed');
    });

    it('should reject non-HTTP protocols', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=file:///etc/passwd'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('URL domain not allowed');
    });

    it('should allow dimensions exactly up to 8192px', async () => {
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
            'http://localhost:3000/api/image-proxy?url=https://res.cloudinary.com/test/image/upload/test.jpg&w=8192'
        );

        const response = await ImageProxyGET(request);
        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('w_8192'),
            expect.any(Object)
        );
    });

    it('should reject dimensions above 8192px limit', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://res.cloudinary.com/test/image/upload/test.jpg&w=8193'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid width or height parameter');
        expect(data.code).toBe('BAD_REQUEST');
    });

    it('should return 400 when width parameter is invalid', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://res.cloudinary.com/test/image/upload/test.jpg&w=invalid'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid width or height parameter');
        expect(data.code).toBe('BAD_REQUEST');
    });

    it('should return 400 when quality parameter is invalid', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://res.cloudinary.com/test/image/upload/test.jpg&q=invalid_quality'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid quality parameter');
        expect(data.code).toBe('BAD_REQUEST');
    });

    it('should process Google user avatar URLs without percent-encoding equal signs', async () => {
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
            'http://localhost:3000/api/image-proxy?url=https://lh3.googleusercontent.com/a/ACg8ocLpCpW3=s96-c&w=200'
        );

        const response = await ImageProxyGET(request);

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://lh3.googleusercontent.com/a/ACg8ocLpCpW3=s200-c',
            expect.any(Object)
        );
    });

    it('should return 400 with generic message when fetching image fails', async () => {
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
        });

        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://img.youtube.com/vi/test/maxresdefault.jpg'
        );

        const response = await ImageProxyGET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Failed to fetch image');
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 500 when fetch throws an error', async () => {
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://img.youtube.com/vi/test/maxresdefault.jpg'
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
            expect.stringContaining('f_webp,q_auto:good,w_800,h_600,c_fill'),
            expect.any(Object)
        );
    });

    it('should process allowed non-Cloudinary URL successfully', async () => {
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
            'http://localhost:3000/api/image-proxy?url=https://img.youtube.com/vi/test/maxresdefault.jpg'
        );

        const response = await ImageProxyGET(request);

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://img.youtube.com/vi/test/maxresdefault.jpg',
            expect.any(Object)
        );
    });

    it('should process Cloudflare R2 image URL successfully', async () => {
        const mockImageData = new ArrayBuffer(1024);
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {
                get: jest.fn().mockReturnValue('image/webp'),
            },
            arrayBuffer: jest.fn().mockResolvedValueOnce(mockImageData),
        });

        const request = new NextRequest(
            'http://localhost:3000/api/image-proxy?url=https://images.jorbites.com/remakes/123-test.webp'
        );

        const response = await ImageProxyGET(request);

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://images.jorbites.com/remakes/123-test.webp',
            expect.any(Object)
        );
    });
});
