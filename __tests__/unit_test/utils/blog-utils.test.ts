import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    readBlogFile,
    getBlogById,
    getAllBlogs,
    getPaginatedBlogs,
} from '@/app/utils/blog-utils';
import fs from 'fs';
import path from 'path';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

// Mock gray-matter
vi.mock('gray-matter', () => ({
    default: vi.fn((content: any) => {
        if (content.includes('error')) {
            throw new Error('Invalid frontmatter');
        }
        return {
            data: {
                title: 'Test Blog',
                user_id: '123',
                date: '2025-01-01',
                description: 'Test description',
            },
            content: 'Test content',
        };
    }),
}));

describe('blog-utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('readBlogFile', () => {
        it('should read and parse a valid blog file', () => {
            const mockContent = `---
title: Test Blog
user_id: 123
date: 2025-01-01
description: Test description
---
Test content`;

            vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

            const result = readBlogFile('/path/to/blog.md');

            expect(result.frontmatter.title).toBe('Test Blog');
            expect(result.frontmatter.user_id).toBe('123');
            expect(result.content).toBe('Test content');
        });

        it('should handle file read errors gracefully', () => {
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                throw new Error('File not found');
            });

            const result = readBlogFile('/path/to/nonexistent.md');

            expect(result.frontmatter.title).toBe('Error');
            expect(result.frontmatter.description).toBe(
                'Error loading blog post'
            );
            expect(result.content).toBe('Error loading blog content.');
        });

        it('should handle invalid frontmatter', () => {
            vi.mocked(fs.readFileSync).mockReturnValue('error content');

            const result = readBlogFile('/path/to/invalid.md');

            expect(result.frontmatter.title).toBe('Error');
            expect(result.content).toBe('Error loading blog content.');
        });
    });

    describe('getBlogById', () => {
        it('should return blog for valid id in default language', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getBlogById('test-blog');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('test-blog');
            expect(result?.slug).toBe('test-blog');
            expect(result?.language).toBe('en');
        });

        it('should return blog for specific language', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getBlogById('test-blog', 'es');

            expect(result).not.toBeNull();
            expect(result?.language).toBe('es');
        });

        it('should fallback to other languages if blog not found in specified language', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );

            vi.mocked(fs.existsSync).mockImplementation((filePath) => {
                const pathStr = filePath.toString();
                // Return true only if it's checking the English directory
                return pathStr.includes('/en/');
            });

            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getBlogById('test-blog', 'fr');

            expect(result).not.toBeNull();
            expect(result?.language).toBe('en'); // Fallback to en
        });

        it('should return null if blog not found in any language', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = await getBlogById('nonexistent-blog');

            expect(result).toBeNull();
        });
    });

    describe('getAllBlogs', () => {
        it('should return all blogs for a language', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                'blog1.md',
                'blog2.md',
                'not-markdown.txt',
            ] as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getAllBlogs('en');

            expect(result).toHaveLength(2); // Only .md files
            expect(result[0].id).toBe('blog1');
            expect(result[1].id).toBe('blog2');
        });

        it('should sort blogs by date (newest first)', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                'old-blog.md',
                'new-blog.md',
            ] as any);

            let readCount = 0;
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                readCount++;
                if (readCount === 1) {
                    return `---
title: Old Blog
date: 2024-01-01
---
Old content`;
                }
                return `---
title: New Blog
date: 2025-01-01
---
New content`;
            });

            const matter = await import('gray-matter');
            vi.mocked(matter.default).mockImplementation((content: any) => {
                if (content.includes('Old')) {
                    return {
                        data: {
                            title: 'Old Blog',
                            date: '2024-01-01',
                            user_id: '123',
                            description: 'Old',
                        },
                        content: 'Old content',
                    } as any;
                }
                return {
                    data: {
                        title: 'New Blog',
                        date: '2025-01-01',
                        user_id: '123',
                        description: 'New',
                    },
                    content: 'New content',
                } as any;
            });

            const result = await getAllBlogs('en');

            expect(result[0].frontmatter.title).toBe('New Blog'); // Newest first
            expect(result[1].frontmatter.title).toBe('Old Blog');
        });

        it('should return empty array if directory does not exist', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = await getAllBlogs('en');

            expect(result).toEqual([]);
        });

        it('should handle read errors gracefully', async () => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation(() => {
                throw new Error('Permission denied');
            });

            const result = await getAllBlogs('en');

            expect(result).toEqual([]);
        });
    });

    describe('getPaginatedBlogs', () => {
        beforeEach(() => {
            vi.mocked(path.join).mockImplementation((...args) =>
                args.join('/')
            );
            vi.mocked(fs.existsSync).mockReturnValue(true);
        });

        it('should return paginated blogs with correct metadata', async () => {
            const mockBlogs = Array.from(
                { length: 25 },
                (_, i) => `blog${i}.md`
            );
            vi.mocked(fs.readdirSync).mockReturnValue(mockBlogs as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getPaginatedBlogs('en', 1, 10);

            expect(result.blogs).toHaveLength(10);
            expect(result.total).toBe(25);
            expect(result.totalPages).toBe(3);
            expect(result.currentPage).toBe(1);
        });

        it('should return correct page of results', async () => {
            const mockBlogs = Array.from(
                { length: 25 },
                (_, i) => `blog${i}.md`
            );
            vi.mocked(fs.readdirSync).mockReturnValue(mockBlogs as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const page2 = await getPaginatedBlogs('en', 2, 10);

            expect(page2.blogs).toHaveLength(10);
            expect(page2.currentPage).toBe(2);
        });

        it('should return remaining items on last page', async () => {
            const mockBlogs = Array.from(
                { length: 25 },
                (_, i) => `blog${i}.md`
            );
            vi.mocked(fs.readdirSync).mockReturnValue(mockBlogs as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const lastPage = await getPaginatedBlogs('en', 3, 10);

            expect(lastPage.blogs).toHaveLength(5); // 25 total, 10 per page, page 3 has 5
            expect(lastPage.currentPage).toBe(3);
        });

        it('should handle empty results', async () => {
            vi.mocked(fs.readdirSync).mockReturnValue([] as any);

            const result = await getPaginatedBlogs('en', 1, 10);

            expect(result.blogs).toHaveLength(0);
            expect(result.total).toBe(0);
            expect(result.totalPages).toBe(0);
        });

        it('should handle page beyond total pages', async () => {
            vi.mocked(fs.readdirSync).mockReturnValue(['blog1.md'] as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = await getPaginatedBlogs('en', 999, 10);

            expect(result.blogs).toHaveLength(0);
            expect(result.totalPages).toBe(1);
            expect(result.currentPage).toBe(999);
        });
    });
});
