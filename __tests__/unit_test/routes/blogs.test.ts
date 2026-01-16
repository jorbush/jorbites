import { expect } from '@jest/globals';
import { GET as BlogsGET } from '@/app/api/blogs/route';
import { GET as BlogIdGET } from '@/app/api/blogs/[id]/route';
import { NextRequest } from 'next/server';

// Mock the blog utilities
jest.mock('@/app/utils/blog-utils', () => ({
    getPaginatedBlogs: jest.fn(),
    getBlogById: jest.fn(),
}));

import { getPaginatedBlogs, getBlogById } from '@/app/utils/blog-utils';

describe('Blogs API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/blogs', () => {
        it('should return paginated blogs successfully', async () => {
            const mockResult = {
                blogs: [
                    {
                        id: 'blog1',
                        slug: 'blog1',
                        frontmatter: {
                            title: 'Test Blog 1',
                            date: '2025-01-01',
                            description: 'Test 1',
                        },
                        content: 'Content 1',
                        language: 'en',
                    },
                ],
                total: 1,
                totalPages: 1,
                currentPage: 1,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest('http://localhost:3000/api/blogs');
            const response = await BlogsGET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockResult);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'en',
                1,
                10,
                'general'
            );
        });

        it('should handle language parameter correctly', async () => {
            const mockResult = {
                blogs: [],
                total: 0,
                totalPages: 0,
                currentPage: 1,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?lang=es'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'es',
                1,
                10,
                'general'
            );
        });

        it('should handle page parameter', async () => {
            const mockResult = {
                blogs: [],
                total: 20,
                totalPages: 2,
                currentPage: 2,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?page=2'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'en',
                2,
                10,
                'general'
            );
        });

        it('should handle pageSize parameter', async () => {
            const mockResult = {
                blogs: [],
                total: 50,
                totalPages: 3,
                currentPage: 1,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?pageSize=20'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'en',
                1,
                20,
                'general'
            );
        });

        it('should handle all query parameters together', async () => {
            const mockResult = {
                blogs: [],
                total: 50,
                totalPages: 3,
                currentPage: 2,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?lang=ca&page=2&pageSize=20'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'ca',
                2,
                20,
                'general'
            );
        });

        it('should default to en for invalid language', async () => {
            const mockResult = {
                blogs: [],
                total: 0,
                totalPages: 0,
                currentPage: 1,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?lang=invalid'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'en',
                1,
                10,
                'general'
            );
        });

        it('should handle invalid page numbers gracefully', async () => {
            const mockResult = {
                blogs: [],
                total: 0,
                totalPages: 0,
                currentPage: 1,
            };

            (getPaginatedBlogs as jest.Mock).mockResolvedValueOnce(mockResult);

            const request = new NextRequest(
                'http://localhost:3000/api/blogs?page=invalid'
            );
            const response = await BlogsGET(request);

            expect(response.status).toBe(200);
            // NaN from parseInt should become 1
            expect(getPaginatedBlogs).toHaveBeenCalledWith(
                'en',
                1,
                10,
                'general'
            );
        });

        it('should return 500 when getPaginatedBlogs throws an error', async () => {
            (getPaginatedBlogs as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const request = new NextRequest('http://localhost:3000/api/blogs');
            const response = await BlogsGET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch blogs');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('GET /api/blogs/[id]', () => {
        it('should return blog by id successfully', async () => {
            const mockBlog = {
                id: 'test-blog',
                slug: 'test-blog',
                frontmatter: {
                    title: 'Test Blog',
                    user_id: '123',
                    date: '2025-01-01',
                    description: 'Test',
                },
                content: 'Test content',
                language: 'en',
            };

            (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog'
            );
            const response = await BlogIdGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockBlog);
            expect(getBlogById).toHaveBeenCalledWith('test-blog', 'en');
        });

        it('should handle language parameter correctly', async () => {
            const mockBlog = {
                id: 'test-blog',
                slug: 'test-blog',
                frontmatter: {
                    title: 'Blog de Prueba',
                    user_id: '123',
                    date: '2025-01-01',
                    description: 'Prueba',
                },
                content: 'Contenido de prueba',
                language: 'es',
            };

            (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog?lang=es'
            );
            const response = await BlogIdGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.language).toBe('es');
            expect(getBlogById).toHaveBeenCalledWith('test-blog', 'es');
        });

        it('should handle Catalan language', async () => {
            const mockBlog = {
                id: 'test-blog',
                slug: 'test-blog',
                frontmatter: {
                    title: 'Blog de Prova',
                    user_id: '123',
                    date: '2025-01-01',
                    description: 'Prova',
                },
                content: 'Contingut de prova',
                language: 'ca',
            };

            (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog?lang=ca'
            );
            const response = await BlogIdGET(request, mockParams);

            expect(response.status).toBe(200);
            expect(getBlogById).toHaveBeenCalledWith('test-blog', 'ca');
        });

        it('should return 404 when blog not found', async () => {
            (getBlogById as jest.Mock).mockResolvedValueOnce(null);

            const mockParams = {
                params: Promise.resolve({ id: 'nonexistent-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/nonexistent-blog'
            );
            const response = await BlogIdGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Blog not found');
            expect(data.code).toBe('NOT_FOUND');
        });

        it('should default to en for invalid language', async () => {
            const mockBlog = {
                id: 'test-blog',
                slug: 'test-blog',
                frontmatter: {
                    title: 'Test Blog',
                    user_id: '123',
                    date: '2025-01-01',
                    description: 'Test',
                },
                content: 'Test content',
                language: 'en',
            };

            (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog?lang=invalid'
            );
            const response = await BlogIdGET(request, mockParams);

            expect(response.status).toBe(200);
            expect(getBlogById).toHaveBeenCalledWith('test-blog', 'en');
        });

        it('should return 500 when getBlogById throws an error', async () => {
            (getBlogById as jest.Mock).mockRejectedValueOnce(
                new Error('File system error')
            );

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog'
            );
            const response = await BlogIdGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch blog');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });

        it('should handle language fallback logic', async () => {
            // Simulate the fallback behavior where getBlogById tries multiple languages
            const mockBlog = {
                id: 'test-blog',
                slug: 'test-blog',
                frontmatter: {
                    title: 'Test Blog',
                    user_id: '123',
                    date: '2025-01-01',
                    description: 'Test',
                },
                content: 'Test content',
                language: 'en', // Fallback language
            };

            (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

            const mockParams = {
                params: Promise.resolve({ id: 'test-blog' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/blogs/test-blog?lang=fr' // Non-existent language
            );
            const response = await BlogIdGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.language).toBe('en'); // Should have fallen back to English
        });
    });
});
