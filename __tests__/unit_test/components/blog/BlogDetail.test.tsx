import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BlogDetail from '@/app/components/blog/BlogDetail';
import { Blog } from '@/app/utils/markdownUtils';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
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

// Mock date-utils
vi.mock('@/app/utils/date-utils', () => ({
    formatDate: () => 'August 29, 2025',
}));

vi.mock('next/image', () => ({
    default: ({ alt }: { alt: string }) => (
        <img
            alt={alt}
            data-testid="blog-image"
        />
    ),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({
        src,
        onClick,
    }: {
        src: string | null;
        onClick?: () => void;
    }) => (
        <img
            src={src || '/placeholder.jpg'}
            alt="avatar"
            data-testid="avatar"
            onClick={onClick}
        />
    ),
}));

vi.mock('@/app/components/VerificationBadge', () => ({
    default: ({ className }: { className?: string }) => (
        <span
            data-testid="verification-badge"
            className={className}
        >
            ✓
        </span>
    ),
}));

describe('BlogDetail', () => {
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
        content: 'This is the blog content',
        language: 'en',
    };

    const mockAuthor = {
        id: '123456',
        name: 'Test Author',
        image: '/avatar.jpg',
        level: 50,
        verified: true,
    };

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the blog detail correctly', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
            />
        );

        // Check if the title is displayed
        expect(screen.getByText('Test Blog Post')).toBeDefined();

        // Check if image is rendered when image is provided
        expect(screen.getByTestId('blog-image')).toBeDefined();

        // Check if date is displayed
        expect(screen.getByText(/August 29, 2025/i)).toBeDefined();

        // Check if author is displayed
        expect(screen.getByText('Test Author')).toBeDefined();
    });

    it('does not render image when image is not provided', () => {
        const blogWithoutImage = {
            ...mockBlog,
            frontmatter: {
                ...mockBlog.frontmatter,
                image: undefined,
            },
        };

        render(
            <BlogDetail
                blog={blogWithoutImage}
                author={mockAuthor}
            />
        );

        // Check if the title is still displayed
        expect(screen.getByText('Test Blog Post')).toBeDefined();

        // Check if image is not rendered when image is not provided
        expect(screen.queryByTestId('blog-image')).toBeNull();
    });

    it('displays author information when provided', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
            />
        );

        expect(screen.getByText('Test Author')).toBeDefined();
        expect(screen.getByTestId('avatar')).toBeDefined();
        expect(screen.getByTestId('verification-badge')).toBeDefined();
    });

    it('displays blog content', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
            />
        );

        expect(screen.getByText('This is the blog content')).toBeDefined();
    });

    it('renders without author', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={null}
            />
        );

        expect(screen.getByText('Test Blog Post')).toBeDefined();
        expect(screen.queryByText('Test Author')).toBeNull();
    });
});
