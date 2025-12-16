import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BlogCard from '@/app/components/blog/BlogCard';
import { Blog } from '@/app/utils/markdownUtils';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
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
    formatDate: (date: string) => {
        return 'August 29, 2025';
    },
}));

vi.mock('next/image', () => ({
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
            image: '/avocado.webp',
            user_id: '123456',
        },
        content: 'Blog content',
        language: 'en',
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the blog card correctly', () => {
        render(<BlogCard blog={mockBlog} />);

        // Check if the title is displayed
        expect(screen.getByText('Test Blog Post')).toBeDefined();

        // Check if description is displayed
        expect(screen.getByText('This is a test blog post')).toBeDefined();

        // Check if image is rendered
        expect(screen.getByTestId('blog-image')).toBeDefined();
    });

    it('displays the date correctly', () => {
        render(<BlogCard blog={mockBlog} />);

        // Check if the date is displayed
        const dateElement = screen.getByText(/August 29, 2025/i);
        expect(dateElement).toBeDefined();
    });
});
