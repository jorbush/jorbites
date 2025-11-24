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
        expect(screen.getAllByTestId('footer-menu-link')).toHaveLength(4);
    });

    it('renders all menu items', () => {
        render(<FooterMenu />);

        const menuLinks = screen.getAllByTestId('footer-menu-link');
        expect(menuLinks).toHaveLength(4);
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

        expect(screen.getAllByTestId('fc-positive-dynamic-icon')).toHaveLength(
            1
        );
        expect(screen.getAllByTestId('fc-manager-icon')).toHaveLength(1);
        expect(screen.getAllByTestId('fc-conference-call-icon')).toHaveLength(
            1
        );
        expect(screen.getAllByTestId('fc-about-icon')).toHaveLength(1);
    });

    it('applies correct CSS classes to links', () => {
        render(<FooterMenu />);

        const menuLinks = screen.getAllByTestId('footer-menu-link');

        menuLinks.forEach((link) => {
            const className = link.getAttribute('class');
            expect(className).toContain('flex');
            expect(className).toContain('items-center');
            expect(className).toContain('space-x-2');
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
            expect(className).toContain('h-4');
            expect(className).toContain('w-4');
        });

        aboutIcons.forEach((icon) => {
            const className = icon.getAttribute('class');
            expect(className).toContain('h-4');
            expect(className).toContain('w-4');
        });
    });

    it('calls translation function with correct keys', () => {
        render(<FooterMenu />);

        expect(mockT).toHaveBeenCalledWith('top_jorbiters');
        expect(mockT).toHaveBeenCalledWith('chefs');
        expect(mockT).toHaveBeenCalledWith('workshops');
        expect(mockT).toHaveBeenCalledWith('about');
    });

    it('renders translated text correctly', () => {
        render(<FooterMenu />);

        expect(screen.getAllByText('top_jorbiters')).toHaveLength(1);
        expect(screen.getAllByText('chefs')).toHaveLength(1);
        expect(screen.getAllByText('workshops')).toHaveLength(1);
        expect(screen.getAllByText('about')).toHaveLength(1);
    });

    it('handles missing translations gracefully', () => {
        // Reset the mock to return the key itself
        mockT.mockImplementation((key: string) => key);

        const { container } = render(<FooterMenu />);

        // Should still render with the key as fallback
        expect(container.textContent).toContain('top_jorbiters');
        expect(container.textContent).toContain('chefs');
        expect(container.textContent).toContain('workshops');
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

        // First should be Top Jorbiters
        expect(menuLinks[0].getAttribute('data-href')).toBe('/top-jorbiters');
        expect(menuLinks[0].textContent).toContain('top_jorbiters');

        // Second should be Chefs
        expect(menuLinks[1].getAttribute('data-href')).toBe('/chefs');
        expect(menuLinks[1].textContent).toContain('chefs');

        // Third should be Workshops
        expect(menuLinks[2].getAttribute('data-href')).toBe('/workshops');
        expect(menuLinks[2].textContent).toContain('workshops');

        // Fourth should be About
        expect(menuLinks[3].getAttribute('data-href')).toBe('/about');
        expect(menuLinks[3].textContent).toContain('about');
    });

    it('has accessible structure with spans for text', () => {
        const { container } = render(<FooterMenu />);

        const spans = container.querySelectorAll('span');
        expect(spans.length).toBeGreaterThanOrEqual(4);

        // Check that spans contain the expected text
        const spanTexts = Array.from(spans).map((span) => span.textContent);
        expect(spanTexts).toContain('top_jorbiters');
        expect(spanTexts).toContain('chefs');
        expect(spanTexts).toContain('workshops');
        expect(spanTexts).toContain('about');
    });
});
