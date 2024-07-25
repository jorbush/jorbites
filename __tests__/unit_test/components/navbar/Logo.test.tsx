import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
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

    it('renders the logo with default light theme', () => {
        render(<Logo />);
        const logo = screen.getByAltText(
            'Logo'
        ) as HTMLImageElement;
        expect(logo).toBeDefined();
        expect(logo.src).toContain('/images/logo-nobg.png');
    });

    it('renders the logo with dark theme', () => {
        vi.mocked(localStorage.getItem).mockReturnValue(
            'dark'
        );
        render(<Logo />);
        const logo = screen.getByAltText(
            'Logo'
        ) as HTMLImageElement;
        expect(logo).toBeDefined();
        expect(logo.src).toContain(
            '/images/no_bg_white.png'
        );
    });

    it('navigates to home page when clicked', () => {
        render(<Logo />);
        const logo = screen.getByAltText('Logo');
        fireEvent.click(logo);
        expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('has correct CSS classes and attributes', () => {
        render(<Logo />);
        const logo = screen.getByAltText('Logo');
        expect(logo.className).contain('cursor-pointer');
        expect(logo.className).contain('md:block');
        expect(logo).toHaveProperty('width', 100);
        expect(logo).toHaveProperty('height', 100);
        expect(logo.style).contain({
            width: 'auto',
            height: 'auto',
        });
    });
});
