import React from 'react';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BlogsClient from '@/app/blog/blogs-client';

const mockPush = vi.fn();
const mockUseSWR = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('swr', () => ({
    default: (key: string) => mockUseSWR(key),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback ?? key,
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/hooks/useTheme', () => ({
    default: () => {},
}));

vi.mock('@/app/components/blog/BlogCard', () => ({
    default: ({
        blog,
    }: {
        blog: { id: string; frontmatter: { title: string } };
    }) => (
        <div data-testid={`blog-card-${blog.id}`}>{blog.frontmatter.title}</div>
    ),
    BlogCardSkeleton: () => <div data-testid="blog-card-skeleton" />,
}));

vi.mock('@/app/components/navigation/Pagination', () => ({
    default: ({ searchParams }: { searchParams: Record<string, unknown> }) => (
        <div
            data-testid="pagination"
            data-search={String(searchParams.search ?? '')}
            data-category={String(searchParams.category ?? '')}
        />
    ),
}));

describe('<BlogsClient />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        window.history.replaceState({}, '', '/blog');
        mockUseSWR.mockReturnValue({
            data: {
                blogs: [
                    {
                        id: 'blog-1',
                        slug: 'blog-1',
                        frontmatter: {
                            title: 'First Story',
                            user_id: 'u1',
                            date: '2026-01-01',
                            description: 'Story description',
                        },
                        content: 'Content',
                        language: 'en',
                    },
                ],
                totalPages: 1,
            },
            isLoading: false,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('renders search bar and category pill tabs in a responsive lg+ toolbar', () => {
        render(<BlogsClient initialPage={1} />);

        const searchInput = screen.getByTestId('blogs-search-input');
        expect(searchInput.classList.contains('text-base')).toBe(true);
        expect(searchInput.classList.contains('md:text-sm')).toBe(true);

        const storiesTab = screen.getByText('Latest Stories');
        expect(storiesTab.className).toContain('bg-green-450');
        expect(storiesTab.className).toContain('rounded-full');

        const toolbar = searchInput.closest('.lg\\:flex-row');
        expect(toolbar).not.toBeNull();
        expect(toolbar?.className).toContain('lg:justify-between');
        expect(toolbar?.contains(storiesTab)).toBe(true);
    });

    it('requests blogs with search query and passes search param to pagination', () => {
        mockUseSWR.mockReturnValue({
            data: {
                blogs: [
                    {
                        id: '3_8_0',
                        slug: '3_8_0',
                        frontmatter: {
                            title: 'Jorbites v3.8.0 Release',
                            user_id: 'u1',
                            date: '2026-11-09',
                            description: 'Release notes',
                        },
                        content: 'Reader mode',
                        language: 'en',
                    },
                ],
                totalPages: 2,
            },
            isLoading: false,
        });

        render(
            <BlogsClient
                initialPage={1}
                initialCategory="releases"
                initialSearch="reader"
            />
        );

        expect(mockUseSWR).toHaveBeenCalledWith(
            '/api/blogs?lang=en&page=1&pageSize=12&category=releases&search=reader'
        );

        const pagination = screen.getByTestId('pagination');
        expect(pagination.getAttribute('data-search')).toBe('reader');
        expect(pagination.getAttribute('data-category')).toBe('releases');
    });

    it('navigates with search query on input change and submit', () => {
        window.history.replaceState({}, '', '/blog?category=releases&page=2');

        render(
            <BlogsClient
                initialPage={2}
                initialCategory="releases"
            />
        );

        const searchInput = screen.getByTestId(
            'blogs-search-input'
        ) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'allergens' } });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(mockPush).toHaveBeenCalledWith(
            '/blog?category=releases&search=allergens',
            { scroll: false }
        );
    });

    it('shows EmptySearchResults when searching returns no blogs and clears search', () => {
        window.history.replaceState({}, '', '/blog?search=nonexistent');
        mockUseSWR.mockReturnValue({
            data: { blogs: [], totalPages: 0 },
            isLoading: false,
        });

        render(
            <BlogsClient
                initialPage={1}
                initialSearch="nonexistent"
            />
        );

        expect(screen.getByTestId('blogs-search-empty')).toBeDefined();
        expect(screen.getByText('No articles match your search')).toBeDefined();

        const clearButtons = screen.getAllByText('Clear search');
        fireEvent.click(clearButtons[0]);

        expect(mockPush).toHaveBeenCalledWith('/blog', { scroll: false });
    });

    it('preserves active search when switching category tabs', () => {
        render(
            <BlogsClient
                initialPage={1}
                initialCategory="general"
                initialSearch="cooking"
            />
        );

        const releasesTab = screen.getByText('Releases');
        fireEvent.click(releasesTab);

        expect(mockPush).toHaveBeenCalledWith(
            '/blog?category=releases&search=cooking&page=1'
        );
    });
});
