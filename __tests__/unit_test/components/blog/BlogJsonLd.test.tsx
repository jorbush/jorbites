import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BlogJsonLd from '@/app/components/blog/BlogJsonLd';
import { Blog } from '@/app/utils/markdownUtils';
import { SafeUser } from '@/app/types';

describe('BlogJsonLd', () => {
    const mockBlog: Blog = {
        id: 'test-article',
        slug: 'test-article',
        frontmatter: {
            title: 'Sample Article Title',
            description: 'Sample article summary for SEO and readers',
            date: '2026-03-15T10:00:00.000Z',
            user_id: 'user_456',
        },
        content:
            '![Cover](/uploads/cover.jpg)\n\nThis is the body text of the article.',
        language: 'en',
        category: 'general',
    };

    const mockAuthor: SafeUser = {
        id: 'user_456',
        name: 'Chef Jordi',
        image: 'https://res.cloudinary.com/demo/avatar.jpg',
        email: 'chef@jorbites.com',
        level: 42,
        verified: true,
        favoriteIds: [],
        emailNotifications: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        resetToken: null,
        resetTokenExpiry: null,
        emailVerified: null,
        badges: [],
    };

    it('renders valid Schema.org BlogPosting JSON-LD with author details', () => {
        const { container } = render(
            <BlogJsonLd
                blog={mockBlog}
                author={mockAuthor}
            />
        );

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(scriptTag).not.toBeNull();

        const json = JSON.parse(scriptTag!.innerHTML);
        expect(json['@context']).toBe('https://schema.org');
        expect(json['@type']).toBe('BlogPosting');
        expect(json.headline).toBe('Sample Article Title');
        expect(json.description).toBe(
            'Sample article summary for SEO and readers'
        );
        expect(json.image).toEqual(['/uploads/cover.jpg']);
        expect(json.datePublished).toBe('2026-03-15T10:00:00.000Z');
        expect(json.author['@type']).toBe('Person');
        expect(json.author.name).toBe('Chef Jordi');
        expect(json.author.url).toBe('https://jorbites.com/profile/user_456');
        expect(json.publisher.name).toBe('Jorbites');
        expect(json.mainEntityOfPage['@id']).toBe(
            'https://jorbites.com/blog/test-article'
        );
        expect(json.articleBody).toBe(mockBlog.content);
    });

    it('handles null author by falling back to Jorbites organization', () => {
        const { container } = render(
            <BlogJsonLd
                blog={mockBlog}
                author={null}
            />
        );

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(scriptTag).not.toBeNull();

        const json = JSON.parse(scriptTag!.innerHTML);
        expect(json.author['@type']).toBe('Organization');
        expect(json.author.name).toBe('Jorbites');
    });

    it('uses fallback image when no markdown image is present', () => {
        const blogWithoutImage: Blog = {
            ...mockBlog,
            content: 'Just pure plain text without any markdown image.',
        };

        const { container } = render(
            <BlogJsonLd
                blog={blogWithoutImage}
                author={null}
            />
        );

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const json = JSON.parse(scriptTag!.innerHTML);
        expect(json.image).toEqual(['https://jorbites.com/avocado.webp']);
    });
});
