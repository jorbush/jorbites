import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Footer from '@/app/components/footer/Footer';
import { version } from '@/package.json';

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the useTheme hook
vi.mock('@/app/hooks/useTheme', () => ({
    default: vi.fn(),
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}));

// Mock FooterMenu component
vi.mock('@/app/components/footer/FooterMenu', () => ({
    default: () => (
        <div data-testid="footer-menu">
            <a
                href="/top-jorbiters"
                data-testid="footer-menu-top-jorbiters"
            >
                Top Jorbiters
            </a>
            <a
                href="/about"
                data-testid="footer-menu-about"
            >
                About
            </a>
        </div>
    ),
}));

describe('<Footer />', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the version badge', () => {
        render(<Footer />);
        const versionLink = screen.getByText(`version ${version}`);
        expect(versionLink).toBeDefined();
        const linkElement = versionLink.closest('a');
        expect(linkElement?.getAttribute('href')).toBe(
            `https://github.com/jorbush/jorbites/releases/tag/v${version}`
        );
    });

    it('renders all social media links', () => {
        render(<Footer />);
        const socialLinks = [
            { label: 'Email', href: 'mailto:jbonetv5@gmail.com' },
            {
                label: 'Repository',
                href: 'https://github.com/jorbush/jorbites',
            },
            { label: 'GitHub', href: 'https://github.com/jorbush' },
            { label: 'Instagram', href: 'https://instagram.com/jorbites' },
            { label: 'Twitter', href: 'https://x.com/jorbitesapp' },
        ];

        socialLinks.forEach((link) => {
            const linkElement = screen.getByLabelText(link.label);
            expect(linkElement.getAttribute('href')).toBe(link.href);
        });
    });

    it('renders the privacy policy and cookies policy links', () => {
        render(<Footer />);
        const privacyLink = screen.getByText('privacy_policy');
        const cookiesLink = screen.getByText('cookies_policy');

        expect(privacyLink).toBeDefined();
        expect(privacyLink.closest('a')?.getAttribute('href')).toBe(
            '/policies/privacy'
        );
        expect(cookiesLink).toBeDefined();
        expect(cookiesLink.closest('a')?.getAttribute('href')).toBe(
            '/policies/cookies'
        );
    });

    it('renders the logo and brand name', () => {
        render(<Footer />);
        const logo = screen.getByAltText('Jorbites Logo');
        const brandName = screen.getByText('Jorbites');

        expect(logo).toBeDefined();
        expect(logo.getAttribute('src')).toBe('/avocado.webp');
        expect(brandName).toBeDefined();
    });

    it('renders the copyright notice with current year', () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear();
        const copyright = screen.getByText((content) =>
            content.includes(`© ${currentYear} Jorbites`)
        );
        expect(copyright).toBeDefined();
    });

    it('applies the correct CSS classes', () => {
        render(<Footer />);
        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).toBeDefined();
        expect(footerElement.className).toContain('w-full');
        expect(footerElement.className).toContain('py-8');
        expect(footerElement.className).toContain('px-4');
        expect(footerElement.className).toContain('border-t');
        expect(footerElement.className).toContain('bg-white');
        expect(footerElement.className).toContain('dark:bg-dark');
    });

    it('has all links with correct attributes', () => {
        render(<Footer />);
        const externalLinks = screen.getAllByRole('link', {
            name: /email|repository|github|instagram|twitter/i,
        });

        externalLinks.forEach((link) => {
            expect(link.getAttribute('target')).toBe('_blank');
            expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        });
    });

    describe('FooterMenu Integration', () => {
        it('renders the FooterMenu component', () => {
            render(<Footer />);
            expect(screen.getByTestId('footer-menu')).toBeDefined();
        });

        it('renders FooterMenu links for Top Jorbiters and About', () => {
            render(<Footer />);

            const topJorbitersLink = screen.getByTestId(
                'footer-menu-top-jorbiters'
            );
            const aboutLink = screen.getByTestId('footer-menu-about');

            expect(topJorbitersLink).toBeDefined();
            expect(topJorbitersLink.getAttribute('href')).toBe(
                '/top-jorbiters'
            );
            expect(topJorbitersLink.textContent).toBe('Top Jorbiters');

            expect(aboutLink).toBeDefined();
            expect(aboutLink.getAttribute('href')).toBe('/about');
            expect(aboutLink.textContent).toBe('About');
        });

        it('places FooterMenu at the top of the footer content', () => {
            render(<Footer />);

            const footerContent =
                screen.getByTestId('footer-menu').parentElement;
            const footerMenu = screen.getByTestId('footer-menu');

            // FooterMenu should be the first child in the flex container
            expect(footerContent?.children[0]).toBe(footerMenu);
        });

        it('maintains correct footer structure with FooterMenu', () => {
            render(<Footer />);

            // All the original footer elements should still be present
            expect(screen.getByTestId('footer-menu')).toBeDefined();
            expect(screen.getByText(`version ${version}`)).toBeDefined();
            expect(screen.getByText('privacy_policy')).toBeDefined();
            expect(screen.getByText('cookies_policy')).toBeDefined();
            expect(screen.getByAltText('Jorbites Logo')).toBeDefined();
        });
    });
});
