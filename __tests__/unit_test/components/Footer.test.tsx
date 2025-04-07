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
});
