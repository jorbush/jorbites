import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Categories, { categories } from '@/app/components/navbar/Categories';
import { usePathname, useSearchParams } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}));

// Mock the Container component
vi.mock('@/app/components/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

// Mock the CategoryBox component
vi.mock('@/app/components/CategoryBox', () => ({
    default: ({ label, selected }: { label: string; selected: boolean }) => (
        <div data-testid={`category-box-${label.toLowerCase()}`}>
            {label} {selected ? '(selected)' : ''}
        </div>
    ),
}));

describe('<Categories />', () => {
    const mockUsePathname = vi.mocked(usePathname);
    const mockUseSearchParams = vi.mocked(useSearchParams);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders nothing when not on the main page', () => {
        mockUsePathname.mockReturnValue('/some-other-page');
        mockUseSearchParams.mockReturnValue({
            get: vi.fn().mockReturnValue(null),
        } as any);

        const { container } = render(<Categories />);
        expect(container.firstChild).toBeNull();
    });

    it('renders all categories on the main page', () => {
        mockUsePathname.mockReturnValue('/');
        mockUseSearchParams.mockReturnValue({
            get: vi.fn().mockReturnValue(null),
        } as any);

        render(<Categories />);

        const container = screen.getByTestId('container');
        expect(container).toBeDefined();

        categories.forEach((category) => {
            const categoryBox = screen.getByTestId(
                `category-box-${category.label.toLowerCase()}`
            );
            expect(categoryBox).toBeDefined();
            expect(categoryBox.textContent?.trim()).toBe(category.label);
        });
    });

    it('marks the selected category', () => {
        mockUsePathname.mockReturnValue('/');
        mockUseSearchParams.mockReturnValue({
            get: vi.fn().mockReturnValue('Fruits'),
        } as any);

        render(<Categories />);

        const selectedCategory = screen.getByTestId('category-box-fruits');
        expect(selectedCategory.textContent).toBe('Fruits (selected)');
    });
});
