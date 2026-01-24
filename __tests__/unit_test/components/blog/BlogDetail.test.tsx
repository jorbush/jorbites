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

vi.mock('@/app/components/blog/BlogCard', () => ({
    default: ({ blog }: { blog: any }) => (
        <div data-testid={`blog-card-${blog.id}`}>{blog.frontmatter.title}</div>
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
            user_id: '123456',
        },
        content: 'This is the blog content',
        language: 'en',
        category: 'general',
    };

    const mockAuthor = {
        id: '123456',
        name: 'Test Author',
        image: '/avatar.jpg',
        email: 'test@example.com',
        hashedPassword: null,
        level: 50,
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

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the blog detail correctly', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
                relatedBlogs={[]}
            />
        );

        // Check if the title is displayed
        expect(screen.getByText('Test Blog Post')).toBeDefined();

        // Check if date is displayed
        expect(screen.getByText(/August 29, 2025/i)).toBeDefined();

        // Check if author is displayed
        expect(screen.getByText('Test Author')).toBeDefined();
    });

    it('displays author information when provided', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
                relatedBlogs={[]}
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
                relatedBlogs={[]}
            />
        );

        expect(screen.getByText('This is the blog content')).toBeDefined();
    });

    it('renders without author', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={null}
                relatedBlogs={[]}
            />
        );

        expect(screen.getByText('Test Blog Post')).toBeDefined();
        expect(screen.queryByText('Test Author')).toBeNull();
    });

    it('displays related blogs when provided', () => {
        const relatedBlogs: Blog[] = [
            {
                id: 'related-1',
                slug: 'related-1',
                frontmatter: {
                    title: 'Related Blog 1',
                    description: 'First related blog',
                    date: '2025-08-28',
                    user_id: '789',
                },
                content: 'Content 1',
                language: 'en',
                category: 'general',
            },
            {
                id: 'related-2',
                slug: 'related-2',
                frontmatter: {
                    title: 'Related Blog 2',
                    description: 'Second related blog',
                    date: '2025-08-27',
                    user_id: '790',
                },
                content: 'Content 2',
                language: 'en',
                category: 'general',
            },
        ];

        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
                relatedBlogs={relatedBlogs}
            />
        );

        // Check if "See more" section is displayed
        expect(screen.getByText('see_more')).toBeDefined();
    });

    it('does not display "See more" section when no related blogs', () => {
        render(
            <BlogDetail
                blog={mockBlog}
                author={mockAuthor}
                relatedBlogs={[]}
            />
        );

        // Check if "See more" section is NOT displayed
        expect(screen.queryByText('see_more')).toBeNull();
    });
});
