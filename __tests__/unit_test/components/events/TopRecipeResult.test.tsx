import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TopRecipeResult from '@/app/components/events/TopRecipeResult';

// Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock CustomProxyImage
vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
            data-testid="mock-proxy-image"
        />
    ),
}));

// Mock Next/Image
vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
            data-testid="mock-next-image"
        />
    ),
}));

// Mock Avatar
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src }: { src: string | null | undefined }) => (
        <div
            data-testid="mock-avatar"
            data-src={src || '/images/placeholder.webp'}
        />
    ),
}));

// Mock Next/Link
vi.mock('next/link', () => ({
    default: ({
        href,
        children,
    }: {
        href: string;
        children: React.ReactNode;
    }) => (
        <a
            href={href}
            data-testid="mock-link"
        >
            {children}
        </a>
    ),
}));

describe('TopRecipeResult Component', () => {
    const mockSession = {
        periodKey: '2026-06',
        winner: {
            id: 'recipe-winner-123',
            title: 'Award Winning Lasagna',
            imageSrc: '/lasagna.webp',
            numLikes: 42,
            user: {
                name: 'Super Chef',
                image: '/avatars/super-chef.webp',
            },
        },
    };

    afterEach(() => {
        cleanup();
    });

    it('renders winner recipe details correctly, including the custom user avatar image', () => {
        render(
            <TopRecipeResult
                category="month"
                session={mockSession}
            />
        );

        // Check translation keys are rendered
        expect(screen.getByText('recipe_of_the_month_winner')).toBeDefined();
        expect(screen.getByText(/period/)).toBeDefined();

        // Check winner details
        expect(screen.getByText('Award Winning Lasagna')).toBeDefined();
        expect(screen.getByText('Super Chef')).toBeDefined();

        // Check user image rendered via Avatar component mock
        const avatars = screen.getAllByTestId('mock-avatar');
        expect(avatars).toHaveLength(1);
        expect(avatars[0].getAttribute('data-src')).toBe(
            '/avatars/super-chef.webp'
        );

        // Check next/image (for badge)
        const badgeImage = screen.getByTestId('mock-next-image');
        expect(badgeImage.getAttribute('src')).toBe(
            '/badges/recipe_of_the_month.webp'
        );

        // Check proxy image (for recipe)
        const proxyImages = screen.getAllByTestId('mock-proxy-image');
        expect(proxyImages).toHaveLength(1);
        expect(proxyImages[0].getAttribute('src')).toBe('/lasagna.webp');
    });

    it('correctly maps navigation links to /recipes/ instead of /recipe/', () => {
        render(
            <TopRecipeResult
                category="month"
                session={mockSession}
            />
        );

        const links = screen.getAllByTestId('mock-link');
        const hrefs = links.map((link) => link.getAttribute('href'));

        // Winner links must navigate to /recipes/
        expect(hrefs).toContain('/recipes/recipe-winner-123');
        expect(hrefs).not.toContain('/recipe/recipe-winner-123');
    });

    it('renders nothing if session or winner is missing', () => {
        const { container } = render(
            <TopRecipeResult
                category="month"
                session={{ periodKey: '2026-06', winner: null }}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});
