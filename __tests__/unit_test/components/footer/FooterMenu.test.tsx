import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FooterMenu from '@/app/components/footer/FooterMenu';

// Mock dependencies
vi.mock('next/link', () => ({
    default: ({
        href,
        className,
        children,
        prefetch,
    }: {
        href: string;
        className?: string;
        children: React.ReactNode;
        prefetch?: boolean;
    }) => (
        <a
            href={href}
            className={className}
            data-testid="footer-menu-link"
            data-href={href}
            data-prefetch={prefetch}
        >
            {children}
        </a>
    ),
}));

vi.mock('react-icons/fc', () => ({
    FcSimCard: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-sim-card-icon"
            className={className}
        />
    ),
    FcPositiveDynamic: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-positive-dynamic-icon"
            className={className}
        />
    ),
    FcManager: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-manager-icon"
            className={className}
        />
    ),
    FcAbout: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-about-icon"
            className={className}
        />
    ),
    FcConferenceCall: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-conference-call-icon"
            className={className}
        />
    ),
    FcNews: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-news-icon"
            className={className}
        />
    ),
    FcDiploma1: ({ className }: { className?: string }) => (
        <div
            data-testid="fc-diploma1-icon"
            className={className}
        />
    ),
}));

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('FooterMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders without crashing', () => {
        render(<FooterMenu />);
        expect(screen.getAllByTestId('footer-menu-link')).toHaveLength(7);
    });

    it('renders all menu items', () => {
        render(<FooterMenu />);

        const menuLinks = screen.getAllByTestId('footer-menu-link');
        expect(menuLinks).toHaveLength(7);
    });

    it('renders Bite Cards link with correct props', () => {
        render(<FooterMenu />);

        const biteCardsLink = screen
            .getAllByTestId('footer-menu-link')
            .find((link) => link.getAttribute('data-href') === '/bite-cards');

        expect(biteCardsLink).toBeDefined();
        expect(biteCardsLink?.getAttribute('data-prefetch')).toBe('false');
        expect(biteCardsLink?.textContent).toContain('bite_cards_title');
    });

    it('renders Top Jorbiters link with correct props', () => {
        render(<FooterMenu />);

        const topJorbitersLink = screen
            .getAllByTestId('footer-menu-link')
            .find(
                (link) => link.getAttribute('data-href') === '/top-jorbiters'
            );

        expect(topJorbitersLink).toBeDefined();
        expect(topJorbitersLink?.getAttribute('data-prefetch')).toBe('false');
        expect(topJorbitersLink?.textContent).toContain('top_jorbiters');
    });

    it('renders Chefs link with correct props', () => {
        render(<FooterMenu />);

        const chefsLink = screen
            .getAllByTestId('footer-menu-link')
            .find((link) => link.getAttribute('data-href') === '/chefs');

        expect(chefsLink).toBeDefined();
        expect(chefsLink?.getAttribute('data-prefetch')).toBe('false');
        expect(chefsLink?.textContent).toContain('chefs');
    });

    it('renders About link with correct props', () => {
        render(<FooterMenu />);

        const aboutLink = screen
            .getAllByTestId('footer-menu-link')
            .find((link) => link.getAttribute('data-href') === '/about');

        expect(aboutLink).toBeDefined();
        expect(aboutLink?.getAttribute('data-prefetch')).toBe('false');
        expect(aboutLink?.textContent).toContain('about');
    });

    it('renders icons for each menu item', () => {
        render(<FooterMenu />);

        expect(screen.getAllByTestId('fc-sim-card-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fc-positive-dynamic-icon')).toHaveLength(
            1
        );
        expect(screen.getAllByTestId('fc-manager-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fc-conference-call-icon')).toHaveLength(
            1
        );
        expect(screen.getAllByTestId('fc-news-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fc-diploma1-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fc-about-icon')).toHaveLength(1);
    });

    it('applies correct CSS classes to links', () => {
        render(<FooterMenu />);

        const menuLinks = screen.getAllByTestId('footer-menu-link');

        menuLinks.forEach((link) => {
            const className = link.getAttribute('class');
            expect(className).toContain('flex');
            expect(className).toContain('items-center');
            expect(className).toContain('gap-x-2');
            expect(className).toContain('rounded-lg');
            expect(className).toContain('bg-neutral-50');
            expect(className).toContain('px-3');
            expect(className).toContain('py-2');
            expect(className).toContain('text-sm');
            expect(className).toContain('transition-all');
            expect(className).toContain('duration-200');
            expect(className).toContain('hover:bg-neutral-100');
        });
    });

    it('applies correct CSS classes to icons', () => {
        render(<FooterMenu />);

        const positiveIcons = screen.getAllByTestId('fc-positive-dynamic-icon');
        const aboutIcons = screen.getAllByTestId('fc-about-icon');

        positiveIcons.forEach((icon) => {
            const className = icon.getAttribute('class');
            expect(className).toContain('size-4');
        });

        aboutIcons.forEach((icon) => {
            const className = icon.getAttribute('class');
            expect(className).toContain('size-4');
        });
    });

    it('calls translation function with correct keys', () => {
        render(<FooterMenu />);

        expect(mockT).toHaveBeenCalledWith('bite_cards_title');
        expect(mockT).toHaveBeenCalledWith('top_jorbiters');
        expect(mockT).toHaveBeenCalledWith('chefs');
        expect(mockT).toHaveBeenCalledWith('workshops');
        expect(mockT).toHaveBeenCalledWith('blog');
        expect(mockT).toHaveBeenCalledWith('courses');
        expect(mockT).toHaveBeenCalledWith('about');
    });

    it('renders translated text correctly', () => {
        render(<FooterMenu />);

        expect(screen.getAllByText('bite_cards_title')).toHaveLength(1);
        expect(screen.getAllByText('top_jorbiters')).toHaveLength(1);
        expect(screen.getAllByText('chefs')).toHaveLength(1);
        expect(screen.getAllByText('workshops')).toHaveLength(1);
        expect(screen.getAllByText('blog')).toHaveLength(1);
        expect(screen.getAllByText('courses')).toHaveLength(1);
        expect(screen.getAllByText('about')).toHaveLength(1);
    });

    it('handles missing translations gracefully', () => {
        // Reset the mock to return the key itself
        mockT.mockImplementation((key: string) => key);

        const { container } = render(<FooterMenu />);

        // Should still render with the key as fallback
        expect(container.textContent).toContain('bite_cards_title');
        expect(container.textContent).toContain('top_jorbiters');
        expect(container.textContent).toContain('chefs');
        expect(container.textContent).toContain('workshops');
        expect(container.textContent).toContain('blog');
        expect(container.textContent).toContain('courses');
        expect(container.textContent).toContain('about');
    });

    it('has correct container structure', () => {
        const { container } = render(<FooterMenu />);

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('flex');
        expect(wrapper.className).toContain('flex-wrap');
        expect(wrapper.className).toContain('justify-center');
        expect(wrapper.className).toContain('gap-4');
    });

    it('renders menu items in correct order', () => {
        render(<FooterMenu />);

        const menuLinks = screen.getAllByTestId('footer-menu-link');

        // First should be Bite Cards
        expect(menuLinks[0].getAttribute('data-href')).toBe('/bite-cards');
        expect(menuLinks[0].textContent).toContain('bite_cards_title');

        // Second should be Top Jorbiters
        expect(menuLinks[1].getAttribute('data-href')).toBe('/top-jorbiters');
        expect(menuLinks[1].textContent).toContain('top_jorbiters');

        // Third should be Chefs
        expect(menuLinks[2].getAttribute('data-href')).toBe('/chefs');
        expect(menuLinks[2].textContent).toContain('chefs');

        // Fourth should be Workshops
        expect(menuLinks[3].getAttribute('data-href')).toBe('/workshops');
        expect(menuLinks[3].textContent).toContain('workshops');

        // Fifth should be Blog
        expect(menuLinks[4].getAttribute('data-href')).toBe('/blog');
        expect(menuLinks[4].textContent).toContain('blog');

        // Sixth should be Courses
        expect(menuLinks[5].getAttribute('data-href')).toBe('/courses');
        expect(menuLinks[5].textContent).toContain('courses');

        // Seventh should be About
        expect(menuLinks[6].getAttribute('data-href')).toBe('/about');
        expect(menuLinks[6].textContent).toContain('about');
    });

    it('has accessible structure with spans for text', () => {
        const { container } = render(<FooterMenu />);

        const spans = container.querySelectorAll('span');
        expect(spans.length).toBeGreaterThanOrEqual(6);

        // Check that spans contain the expected text
        const spanTexts = Array.from(spans).map((span) => span.textContent);
        expect(spanTexts).toContain('top_jorbiters');
        expect(spanTexts).toContain('chefs');
        expect(spanTexts).toContain('workshops');
        expect(spanTexts).toContain('blog');
        expect(spanTexts).toContain('courses');
        expect(spanTexts).toContain('about');
    });
});
