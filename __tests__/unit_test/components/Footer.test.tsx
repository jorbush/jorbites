import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Footer from '@/app/components/Footer';
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

describe('<Footer />', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the Footer component', () => {
        render(<Footer />);
        expect(screen.getByText(/version 0.5/)).toBeDefined();
        expect(screen.getByText('contact:')).toBeDefined();
        expect(screen.getByText('jbonetv5@gmail.com')).toBeDefined();
    });

    it('uses the useTranslation hook', () => {
        render(<Footer />);
        expect(screen.getByText(`version ${version}`)).toBeDefined();
        expect(screen.getByText(/contact:/)).toBeDefined();
        expect(screen.getByText('jbonetv5@gmail.com')).toBeDefined();
    });

    it('renders the privacy policy and cookies policy links', () => {
        render(<Footer />);
        expect(screen.getByText('privacy_policy')).toBeDefined();
        expect(screen.getByText('cookies_policy')).toBeDefined();
    });

    it('applies the correct CSS classes', () => {
        render(<Footer />);
        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).not.toBeNull();
        expect(footerElement.className).toContain('w-full');
        expect(footerElement.className).toContain('p-4');
        expect(footerElement.className).toContain('text-neutral-500');
        expect(footerElement.className).toContain('dark:text-gray-600');
    });
});
