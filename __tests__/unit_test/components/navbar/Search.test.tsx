import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Search from '@/app/components/navbar/Search';
import React from 'react';

// Mock the Logo component
vi.mock('@/app/components/navbar/Logo', () => ({
    default: () => <div data-testid="mock-logo">Logo</div>,
}));

// Mock the BiSearch icon
vi.mock('react-icons/bi', () => ({
    BiSearch: () => <div data-testid="mock-search-icon">Search Icon</div>,
}));

describe('<Search />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the Logo component', () => {
        render(<Search onClick={() => {}} />);
        expect(screen.getByTestId('mock-logo')).toBeDefined();
    });

    it('renders the search icon', () => {
        render(<Search onClick={() => {}} />);
        expect(screen.getByTestId('mock-search-icon')).toBeDefined();
    });

    it('calls onClick handler when search icon is clicked', () => {
        const handleClick = vi.fn();
        render(<Search onClick={handleClick} />);

        const searchIcon = screen.getByTestId('mock-search-icon').parentElement;
        fireEvent.click(searchIcon!);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has the correct CSS classes for the search icon container', () => {
        render(<Search onClick={() => {}} />);

        const searchIconContainer =
            screen.getByTestId('mock-search-icon').parentElement;
        expect(searchIconContainer?.className).contain('max-w-[35px]');
        expect(searchIconContainer?.className).contain('cursor-pointer');
        expect(searchIconContainer?.className).contain('rounded-full');
        expect(searchIconContainer?.className).contain('bg-green-450');
        expect(searchIconContainer?.className).contain('p-2');
        expect(searchIconContainer?.className).contain('text-white');
        expect(searchIconContainer?.className).contain('shadow-sm');
        expect(searchIconContainer?.className).contain('transition');
        expect(searchIconContainer?.className).contain('hover:shadow-md');
        expect(searchIconContainer?.className).contain('dark:text-dark');
    });
});
