import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileBlogsContent from '@/app/components/profile/ProfileBlogsContent';
import { Blog } from '@/app/utils/markdownUtils';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(() => null),
    }),
    usePathname: () => '/profile/user1',
}));

const createMockBlog = (id: string, title: string): Blog => ({
    id,
    slug: id,
    content: 'Blog content',
    language: 'en',
    frontmatter: {
        title,
        description: `Description for ${title}`,
        date: '2026-01-01',
        user_id: 'user1',
    },
});

describe('ProfileBlogsContent Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders empty state when no blogs are provided', () => {
        render(
            <ProfileBlogsContent
                blogs={[]}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-blogs-empty')).toBeDefined();
        expect(screen.getByText('no_blogs_found')).toBeDefined();
    });

    it('renders blogs grid when blogs are provided without pagination if <= 12', () => {
        const blogs = [
            createMockBlog('b1', 'First Culinary Story'),
            createMockBlog('b2', 'Second Culinary Story'),
        ];

        render(
            <ProfileBlogsContent
                blogs={blogs}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-blogs-content')).toBeDefined();
        expect(screen.getByText('First Culinary Story')).toBeDefined();
        expect(screen.getByText('Second Culinary Story')).toBeDefined();
        expect(
            screen.queryByRole('navigation', { name: 'Pagination' })
        ).toBeNull();
    });

    it('paginates blogs with 12 items per page when more than 12 blogs exist', () => {
        const blogs = Array.from({ length: 25 }, (_, i) =>
            createMockBlog(`b-${i + 1}`, `Story Title ${i + 1}`)
        );

        render(
            <ProfileBlogsContent
                blogs={blogs}
                searchParams={{ page: '1' }}
            />
        );

        // Page 1 should display stories 1 through 12
        expect(screen.getByText('Story Title 1')).toBeDefined();
        expect(screen.getByText('Story Title 12')).toBeDefined();
        expect(screen.queryByText('Story Title 13')).toBeNull();

        // Pagination should be visible with 3 total pages
        expect(
            screen.getByRole('navigation', { name: 'Pagination' })
        ).toBeDefined();
        expect(screen.getByText('1 of 3')).toBeDefined();
    });

    it('displays second page items when searchParams.page is 2', () => {
        const blogs = Array.from({ length: 25 }, (_, i) =>
            createMockBlog(`b-${i + 1}`, `Story Title ${i + 1}`)
        );

        render(
            <ProfileBlogsContent
                blogs={blogs}
                searchParams={{ page: '2' }}
            />
        );

        expect(screen.queryByText('Story Title 1')).toBeNull();
        expect(screen.getByText('Story Title 13')).toBeDefined();
        expect(screen.getByText('Story Title 24')).toBeDefined();
        expect(screen.queryByText('Story Title 25')).toBeNull();
        expect(screen.getByText('2 of 3')).toBeDefined();
    });
});
