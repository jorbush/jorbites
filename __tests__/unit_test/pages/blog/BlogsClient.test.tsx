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
import { Blog } from '@/app/utils/markdownUtils';

const mockPush = vi.fn();
const mockUseSWR = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: vi.fn(),
    }),
}));

vi.mock('swr', () => ({
    default: (key: string, fetcher: any) => mockUseSWR(key, fetcher),
}));

vi.mock('@/app/hooks/useTheme', () => ({
    default: () => {},
}));

vi.mock('@/app/components/blog/BlogCard', () => ({
    default: ({ blog }: { blog: Blog }) => (
        <div data-testid="blog-card">{blog.frontmatter.title}</div>
    ),
    BlogCardSkeleton: () => <div data-testid="blog-card-skeleton" />,
}));

const sampleBlogs: Blog[] = [
    {
        id: 'pasta-guide',
        slug: 'pasta-guide',
        frontmatter: {
            title: 'Pasta Guide',
            user_id: 'u1',
            date: '2026-01-01',
            description: 'Homemade pasta tips',
        },
        content: 'Content',
        language: 'en',
        category: 'general',
    },
];

describe('<BlogsClient />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSWR.mockReturnValue({
            data: { blogs: sampleBlogs, totalPages: 1 },
            isLoading: false,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('renders search input with mobile tap-zoom prevention classes', () => {
        render(
            <BlogsClient
                initialPage={1}
                initialCategory="general"
            />
        );

        const searchInput = screen.getByTestId('blogs-search-input');
        expect(searchInput.classList.contains('text-base')).toBe(true);
        expect(searchInput.classList.contains('md:text-sm')).toBe(true);
        expect(mockUseSWR).toHaveBeenCalledWith(
            '/api/blogs?lang=en&page=1&pageSize=12&category=general',
            expect.any(Function)
        );
    });

    it('updates SWR query and URL when typing a search query', () => {
        vi.useFakeTimers();

        render(
            <BlogsClient
                initialPage={2}
                initialCategory="general"
            />
        );

        const searchInput = screen.getByTestId('blogs-search-input');
        fireEvent.change(searchInput, { target: { value: 'pasta' } });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockPush).toHaveBeenCalledWith(
            '/blog?category=general&page=1&search=pasta',
            { scroll: false }
        );
        expect(mockUseSWR).toHaveBeenLastCalledWith(
            '/api/blogs?lang=en&page=1&pageSize=12&category=general&search=pasta',
            expect.any(Function)
        );
    });

    it('renders empty search state and clears search when clear button is clicked', () => {
        mockUseSWR.mockReturnValue({
            data: { blogs: [], totalPages: 1 },
            isLoading: false,
        });

        render(
            <BlogsClient
                initialPage={1}
                initialCategory="general"
                initialSearch="nonexistent"
            />
        );

        expect(screen.getByTestId('blogs-search-empty')).toBeDefined();

        fireEvent.click(screen.getByTestId('blogs-search-clear'));

        expect(mockPush).toHaveBeenCalledWith('/blog?category=general&page=1', {
            scroll: false,
        });
    });
});
