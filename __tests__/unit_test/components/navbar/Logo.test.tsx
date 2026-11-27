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
    default: ({ alt, ...props }: any) => (
        <img
            alt={alt}
            {...props}
        />
    ),
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

    it('renders the avocado icon and Jorbites brand text', () => {
        render(<Logo />);
        const logoImg = screen.getByAltText(
            'Jorbites Logo'
        ) as HTMLImageElement;
        const brandText = screen.getByText('Jorbites');

        expect(logoImg).toBeDefined();
        expect(logoImg.src).toContain('/avocado.webp');
        expect(brandText).toBeDefined();
        expect(brandText.className).toContain('font-extrabold');
        expect(brandText.className).toContain('dark:text-white');
    });

    it('navigates to home page when clicked', () => {
        render(<Logo />);
        const button = screen.getByRole('button', { name: 'Jorbites' });
        fireEvent.click(button);
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('has correct CSS classes and attributes', () => {
        render(<Logo />);
        const logoImg = screen.getByAltText(
            'Jorbites Logo'
        ) as HTMLImageElement;

        expect(logoImg).toHaveProperty('width', 222);
        expect(logoImg).toHaveProperty('height', 194);
        const button = logoImg.closest('button');
        expect(button?.getAttribute('data-cy')).toBe('logo');
        expect(button?.className).toContain('cursor-pointer');
        expect(button?.className).toContain('flex');
    });
});
