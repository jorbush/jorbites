import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logo from '@/app/components/navbar/Logo';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the next/image component
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}));

describe('<Logo />', () => {
    const originalLocalStorage = window.localStorage;
    const mockRouter = {
        back: vi.fn(),
        push: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Mock localStorage
        const mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
        });
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
        // Restore original localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
        });
    });

    it('renders both light and dark mode logos', () => {
        render(<Logo />);
        const logos = screen.getAllByAltText('Logo') as HTMLImageElement[];
        expect(logos).toHaveLength(2);

        const lightLogo = logos.find(
            (img) =>
                img.src.includes('logo-nobg.webp') ||
                img.src.includes('logo_christmas_black.webp')
        );
        const darkLogo = logos.find(
            (img) =>
                img.src.includes('no_bg_white.webp') ||
                img.src.includes('logo_christmas_white.webp')
        );

        expect(lightLogo).toBeDefined();
        expect(lightLogo?.className).toContain('dark:hidden');

        expect(darkLogo).toBeDefined();
        expect(darkLogo?.className).toContain('dark:block');
    });

    it('navigates to home page when clicked', () => {
        render(<Logo />);
        const logos = screen.getAllByAltText('Logo');
        fireEvent.click(logos[0]);
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('has correct CSS classes and attributes', () => {
        render(<Logo />);
        const logos = screen.getAllByAltText('Logo') as HTMLImageElement[];
        const lightLogo = logos.find(
            (img) =>
                img.src.includes('logo-nobg.webp') ||
                img.src.includes('logo_christmas_black.webp')
        );

        expect(lightLogo).toHaveProperty('width', 128);
        expect(lightLogo).toHaveProperty('height', 29);
        const container = lightLogo?.closest('div');
        expect(container?.className).toContain('cursor-pointer');
        expect(container?.className).toContain('md:block');
    });
});
