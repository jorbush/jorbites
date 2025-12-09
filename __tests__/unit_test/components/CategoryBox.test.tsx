import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CategoryBox from '@/app/components/CategoryBox';
import { FaHome } from 'react-icons/fa';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    usePathname: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<CategoryBox />', () => {
    const mockPush = vi.fn();
    const mockGet = vi.fn();
    const mockToString = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({
            push: mockPush,
        });
        (useSearchParams as any).mockReturnValue({
            get: mockGet,
            toString: mockToString,
        });
        (usePathname as any).mockReturnValue('/');
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with icon and label', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
            />
        );
        expect(screen.getByText('home')).toBeDefined();
        expect(screen.getByTestId('fa-home')).toBeDefined();
    });

    it('applies selected styles when selected prop is true', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                selected
            />
        );
        const container = screen.getAllByText('home')[0].parentElement;
        expect(container?.className).toContain('border-b-neutral-800');
        expect(container?.className).toContain('text-neutral-800');
    });

    it('applies default styles when selected prop is false', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
            />
        );
        const container = screen.getAllByText('home')[0].parentElement;
        expect(container?.className).toContain('border-transparent');
        expect(container?.className).toContain('text-neutral-500');
    });

    it('calls router.push with correct URL when clicked and category is not selected', () => {
        mockGet.mockReturnValue(null);
        mockToString.mockReturnValue('');

        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
            />
        );
        fireEvent.click(screen.getByText('home'));

        expect(mockPush).toHaveBeenCalledWith('/?category=Home');
    });

    it('calls router.push with correct URL when clicked and category is already selected', () => {
        mockGet.mockReturnValue('Home');
        mockToString.mockReturnValue('category=Home');

        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
            />
        );
        fireEvent.click(screen.getByText('home'));

        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('preserves other query parameters when updating category', () => {
        mockGet.mockReturnValue(null);
        mockToString.mockReturnValue('otherParam=value');

        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
            />
        );
        fireEvent.click(screen.getByText('home'));

        expect(mockPush).toHaveBeenCalledWith(
            '/?category=Home&otherParam=value'
        );
    });
});
