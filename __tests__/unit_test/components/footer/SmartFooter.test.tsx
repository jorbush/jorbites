import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock Next.js Link and Image components
vi.mock('next/link', () => ({
    default: ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));

vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        width,
        height,
    }: {
        src: string;
        alt: string;
        width: number;
        height: number;
    }) => (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
        />
    ),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaGithub: () => <svg data-testid="icon-github" />,
    FaTwitter: () => <svg data-testid="icon-twitter" />,
    FaInstagram: () => <svg data-testid="icon-instagram" />,
    FaEnvelope: () => <svg data-testid="icon-email" />,
}));

vi.mock('react-icons/ri', () => ({
    RiGitRepositoryLine: () => <svg data-testid="icon-repository" />,
}));

// Mock package.json
vi.mock('@/package.json', () => ({
    default: {
        version: '1.0.0',
    },
}));

// Import the component after all mocks are set up
import SmartFooter from '@/app/components/footer/SmartFooter';

describe('SmartFooter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders footer element', () => {
        render(<SmartFooter />);
        const footer = screen.getByTestId('footer');
        expect(footer).toBeDefined();
        expect(footer.tagName).toBe('FOOTER');
    });

    it('renders all social media links', () => {
        render(<SmartFooter />);

        expect(screen.getByTestId('icon-email')).toBeDefined();
        expect(screen.getByTestId('icon-repository')).toBeDefined();
        expect(screen.getByTestId('icon-github')).toBeDefined();
        expect(screen.getByTestId('icon-instagram')).toBeDefined();
        expect(screen.getByTestId('icon-twitter')).toBeDefined();
    });

    it('renders navigation links', () => {
        render(<SmartFooter />);

        const aboutLink = screen.getByText('Sobre Jorbites');
        const privacyLink = screen.getByText('Política de Privacidad');
        const cookiesLink = screen.getByText('Política de Cookies');

        expect(aboutLink).toBeDefined();
        expect(privacyLink).toBeDefined();
        expect(cookiesLink).toBeDefined();
    });

    it('renders version information', () => {
        render(<SmartFooter />);

        const versionText = screen.getByText(/v1\.0\.0/);
        expect(versionText).toBeDefined();
    });

    it('renders copyright notice', () => {
        render(<SmartFooter />);

        const currentYear = new Date().getFullYear();
        const copyrightText = screen.getByText(
            new RegExp(`© ${currentYear} Jorbites`)
        );
        expect(copyrightText).toBeDefined();
    });

    it('renders logo image', () => {
        render(<SmartFooter />);

        const logo = screen.getByAltText('Jorbites');
        expect(logo).toBeDefined();
        expect(logo.getAttribute('src')).toBe('/android-chrome-192x192.png');
    });
});
