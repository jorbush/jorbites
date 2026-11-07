import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import BlogCard from '@/app/components/blog/BlogCard';
import { Blog } from '@/app/utils/markdownUtils';

const mockPush = vi.fn();

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock i18n-related modules
vi.mock('i18next', () => ({
    default: {
        use: () => ({
            use: () => ({
                use: () => ({
                    init: () => ({}),
                }),
            }),
        }),
        language: 'en',
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
    initReactI18next: {},
}));

vi.mock('i18next-http-backend', () => ({
    default: {},
}));

vi.mock('i18next-browser-languagedetector', () => ({
    default: {},
}));

// Mock date-utils to avoid i18n dependency
vi.mock('@/app/utils/date-utils', () => ({
    formatDate: () => {
        return 'August 29, 2025';
    },
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ alt }: { alt: string }) => (
        <img
            alt={alt}
            data-testid="blog-image"
        />
    ),
}));

describe('BlogCard', () => {
    // Sample blog data for testing
    const mockBlog: Blog = {
        id: 'test-blog',
        slug: 'test-blog',
        frontmatter: {
            title: 'Test Blog Post',
            description: 'This is a test blog post',
            date: '2025-08-29',
            user_id: '123456',
        },
        content: 'Blog content without image',
        language: 'en',
        category: 'general',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the blog card correctly', () => {
        render(<BlogCard blog={mockBlog} />);

        // Check if the title is displayed
        expect(screen.getByText('Test Blog Post')).toBeDefined();

        // Check if description is displayed
        expect(screen.getByText('This is a test blog post')).toBeDefined();

        // Check read more text is displayed
        expect(screen.getByText('read_more')).toBeDefined();
    });

    it('displays the date correctly', () => {
        render(<BlogCard blog={mockBlog} />);

        // Check if the date is displayed
        const dateElement = screen.getByText(/August 29, 2025/i);
        expect(dateElement).toBeDefined();
    });

    it('renders thumbnail when blog content has markdown image', () => {
        const blogWithImage: Blog = {
            ...mockBlog,
            content: 'Hello world ![Cover Image](/images/cover.webp) end.',
        };

        render(<BlogCard blog={blogWithImage} />);
        expect(screen.getByTestId('blog-image')).toBeDefined();
    });

    it('navigates to blog detail on title button click', () => {
        render(<BlogCard blog={mockBlog} />);

        const titleBtn = screen.getByRole('button', {
            name: 'Test Blog Post',
        });
        fireEvent.click(titleBtn);

        expect(mockPush).toHaveBeenCalledWith('/blog/test-blog');
    });
});
