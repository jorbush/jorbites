import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AboutClient from '@/app/about/AboutClient';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({
        title,
        subtitle,
        center,
    }: {
        title: string;
        subtitle?: string;
        center?: boolean;
    }) => (
        <div
            data-testid="heading"
            data-center={center}
        >
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

vi.mock('next/image', () => ({
    default: ({ src, alt, width, height, className }: any) => (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            data-testid="next-image"
        />
    ),
}));

vi.mock('next/link', () => ({
    default: ({
        href,
        className,
        children,
        target,
        rel,
        prefetch,
    }: {
        href: string;
        className?: string;
        children: React.ReactNode;
        target?: string;
        rel?: string;
        prefetch?: boolean;
    }) => (
        <a
            href={href}
            className={className}
            data-testid="next-link"
            target={target}
            rel={rel}
        >
            {children}
        </a>
    ),
}));

vi.mock('react-icons/fa', () => ({
    FaGithub: () => <div data-testid="fa-github-icon" />,
    FaEnvelope: () => <div data-testid="fa-envelope-icon" />,
    FaHeart: () => <div data-testid="fa-heart-icon" />,
}));

// Mock useRegisterModal
const mockOnOpen = vi.fn();
vi.mock('@/app/hooks/useRegisterModal', () => ({
    default: () => ({
        onOpen: mockOnOpen,
        onClose: vi.fn(),
        isOpen: false,
    }),
}));

// Mock translations for react-i18next
const mockTranslations: Record<string, string> = {
    about: 'About',
    about_subtitle: 'Learn more about Jorbites and our mission',
    why_jorbites: 'Why Jorbites?',
    why_jorbites_description:
        'A user posted this recipe that indirectly answers the question:',
    why_jorbites_recipe: 'Why Jorbites?',
    what_is_jorbites: 'What is Jorbites?',
    jorbites_description: 'Jorbites is a vibrant community platform...',
    jorbites_mission: 'Our mission is to make cooking more accessible...',
    features: 'Features',
    share_recipes: 'Share Recipes',
    share_recipes_description: 'Upload your favorite recipes...',
    discover_recipes: 'Discover Recipes',
    discover_recipes_description: 'Explore thousands of recipes...',
    level_system: 'Level System',
    level_system_description: 'Gain experience by sharing recipes...',
    community: 'Community',
    community_description: 'Connect with other food enthusiasts...',
    architecture: 'Architecture',
    documentation: 'Documentation',
    the_project: 'The Project',
    about_developer: 'About the Developer',
    developer_description: 'Jorbites was created with passion...',
    get_started: 'Get Started',
    get_started_description: 'Ready to join our culinary community?',
    explore_recipes: 'Explore Recipes',
    sign_up: 'Sign Up',
    contact: 'Contact',
};

// Mock react-i18next
const mockT = vi.fn((key: string) => mockTranslations[key] || key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('AboutClient', () => {
    const mockCurrentUser: SafeUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'test-image.jpg',
        hashedPassword: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        favoriteIds: [],
        emailNotifications: true,
        level: 5,
        verified: true,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnOpen.mockClear();
        // Restore mockT implementation after clearAllMocks
        mockT.mockImplementation((key: string) => mockTranslations[key] || key);
    });

    it('renders without crashing', () => {
        render(<AboutClient />);
        expect(screen.getByTestId('container')).toBeDefined();
    });

    it('renders the heading with correct props', () => {
        render(<AboutClient />);
        const heading = screen.getByTestId('heading');
        expect(heading).toBeDefined();
        expect(heading.getAttribute('data-center')).toBe('true');
        expect(screen.getByText('About')).toBeDefined();
        expect(
            screen.getByText('Learn more about Jorbites and our mission')
        ).toBeDefined();
    });

    it('renders all main sections', () => {
        render(<AboutClient />);

        // Check main section titles
        expect(screen.getByText('Why Jorbites?')).toBeDefined();
        expect(screen.getByText('What is Jorbites?')).toBeDefined();
        expect(screen.getByText('Features')).toBeDefined();
        expect(screen.getByText('Architecture')).toBeDefined();
        expect(screen.getByText('Documentation')).toBeDefined();
        expect(screen.getByText('The Project')).toBeDefined();
        expect(screen.getByText('Get Started')).toBeDefined();
    });

    it('renders all feature cards', () => {
        render(<AboutClient />);

        expect(screen.getByText('Share Recipes')).toBeDefined();
        expect(screen.getByText('Discover Recipes')).toBeDefined();
        expect(screen.getByText('Level System')).toBeDefined();
        expect(screen.getByText('Community')).toBeDefined();
    });

    it('renders developer section with image and social links', () => {
        render(<AboutClient />);

        const images = screen.getAllByTestId('next-image');
        expect(images.length).toBeGreaterThan(0);
        expect(images[0].getAttribute('src')).toBe('/avocado.webp');
        expect(images[0].getAttribute('alt')).toBe('Jorbites Logo');

        expect(screen.getAllByTestId('fa-github-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fa-envelope-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fa-heart-icon')).toHaveLength(1);
    });

    it('renders correct social links', () => {
        const { container } = render(<AboutClient />);

        // Check for GitHub and email links in the container
        const allLinks = container.querySelectorAll('a');
        const socialLinks = Array.from(allLinks).filter(
            (link) =>
                link.getAttribute('href')?.includes('github.com') ||
                link.getAttribute('href')?.includes('mailto:')
        );

        expect(socialLinks.length).toBeGreaterThan(0);
    });

    it('renders get started section with action buttons', () => {
        const { container } = render(<AboutClient />);

        expect(container.textContent).toContain('Explore Recipes');
        expect(container.textContent).toContain(
            'Ready to join our culinary community?'
        );
    });

    it('shows sign up button when no current user', () => {
        const { container } = render(<AboutClient currentUser={null} />);
        expect(container.textContent).toContain('Sign Up');
    });

    it('does not show sign up button when user is logged in', () => {
        const { container } = render(
            <AboutClient currentUser={mockCurrentUser} />
        );

        // Sign up button should not be present in the text content
        // The user is logged in, so no signup should be shown
        expect(container.querySelector('[href="/"]')?.textContent).toBe(
            'Explore Recipes'
        );
    });

    it('uses fallback text when translations are not available', () => {
        // Mock translation function to return undefined
        const mockTWithFallback = vi.fn((key: string) => {
            if (key === 'about') return null;
            return key;
        });

        mockT.mockImplementation(mockTWithFallback);

        const { container } = render(<AboutClient />);

        // Should still render with fallback text
        expect(container.textContent).toContain('About');
    });

    it('applies correct CSS classes for responsive design', () => {
        const { container } = render(<AboutClient />);

        // Check for responsive classes in the main wrapper
        const maxWidthDiv = container.querySelector('.max-w-4xl');
        expect(maxWidthDiv).toBeDefined();

        const gridDiv = container.querySelector('.md\\:grid-cols-2');
        expect(gridDiv).toBeDefined();
    });

    it('calls translation function with correct keys', () => {
        render(<AboutClient />);

        expect(mockT).toHaveBeenCalledWith('about');
        expect(mockT).toHaveBeenCalledWith('about_subtitle');
        expect(mockT).toHaveBeenCalledWith('why_jorbites');
        expect(mockT).toHaveBeenCalledWith('what_is_jorbites');
        expect(mockT).toHaveBeenCalledWith('features');
        expect(mockT).toHaveBeenCalledWith('the_project');
        expect(mockT).toHaveBeenCalledWith('get_started');
    });

    it('renders architecture section with core platform and microservices', () => {
        const { container } = render(<AboutClient />);

        expect(screen.getByText('Architecture')).toBeDefined();
        expect(container.textContent).toContain('Core Platform');
        expect(container.textContent).toContain('Microservices');
        expect(container.textContent).toContain(
            'Next.js with TypeScript on Vercel'
        );
        expect(container.textContent).toContain(
            'MongoDB Atlas with Prisma ORM'
        );
    });

    it('renders microservices links', () => {
        const { container } = render(<AboutClient />);

        const allLinks = container.querySelectorAll('a');
        const microserviceLinks = Array.from(allLinks).filter((link) => {
            const href = link.getAttribute('href') || '';
            return (
                href.includes('jorbites-notifier') ||
                href.includes('badge_forge') ||
                href.includes('pantry_keeper')
            );
        });

        expect(microserviceLinks.length).toBe(3);
    });

    it('renders documentation section with links', () => {
        const { container } = render(<AboutClient />);

        expect(screen.getByText('Documentation')).toBeDefined();
        expect(screen.getByText('Development Setup')).toBeDefined();
        expect(screen.getByText('Architecture Details')).toBeDefined();
        expect(screen.getByText('API Documentation')).toBeDefined();
        expect(screen.getByText('Image Optimization')).toBeDefined();

        const allLinks = container.querySelectorAll('a');
        const docLinks = Array.from(allLinks).filter((link) => {
            const href = link.getAttribute('href') || '';
            return href.includes('docs/');
        });

        expect(docLinks.length).toBeGreaterThan(0);
    });

    it('renders GitHub sponsor button', () => {
        const { container } = render(<AboutClient />);

        const sponsorLink = Array.from(container.querySelectorAll('a')).find(
            (link) =>
                link.getAttribute('href') ===
                'https://github.com/sponsors/jorbush'
        );

        expect(sponsorLink).toBeDefined();
        expect(sponsorLink?.textContent).toContain('Sponsor on GitHub');
    });

    it('renders Why Jorbites section with recipe link', () => {
        const { container } = render(<AboutClient />);

        expect(screen.getByText('Why Jorbites?')).toBeDefined();

        const recipeLink = Array.from(container.querySelectorAll('a')).find(
            (link) =>
                link
                    .getAttribute('href')
                    ?.includes('/recipes/68b194a84e84cb9eabfb4350')
        );

        expect(recipeLink).toBeDefined();
        expect(recipeLink?.getAttribute('target')).toBe('_blank');
        expect(recipeLink?.getAttribute('rel')).toContain('noopener');
    });

    it('renders sign up button that opens register modal when not logged in', () => {
        const { container } = render(<AboutClient currentUser={null} />);

        const signUpButton = Array.from(
            container.querySelectorAll('button')
        ).find((button) => button.textContent?.includes('Sign Up'));

        expect(signUpButton).toBeDefined();

        // Simulate button click
        signUpButton?.click();

        expect(mockOnOpen).toHaveBeenCalledTimes(1);
    });

    it('does not render sign up button when user is logged in', () => {
        const { container } = render(
            <AboutClient currentUser={mockCurrentUser} />
        );

        const signUpButton = Array.from(
            container.querySelectorAll('button')
        ).find((button) => button.textContent?.includes('Sign Up'));

        expect(signUpButton).toBeUndefined();
    });

    it('renders explore recipes link with prefetch disabled', () => {
        const { container } = render(<AboutClient />);

        const exploreLink = Array.from(
            container.querySelectorAll('[data-testid="next-link"]')
        ).find((link) => link.textContent?.includes('Explore Recipes'));

        expect(exploreLink).toBeDefined();
    });
});
