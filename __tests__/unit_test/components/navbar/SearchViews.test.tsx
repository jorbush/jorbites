import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DesktopSearch from '@/app/components/navbar/DesktopSearch';
import MobileSearch from '@/app/components/navbar/MobileSearch';

vi.mock('@/app/components/navbar/Logo', () => ({
    default: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/app/components/navbar/OrderByDropdown', () => ({
    default: () => <div data-testid="order-by-dropdown">OrderBy</div>,
}));

vi.mock('@/app/components/navbar/PeriodFilter', () => ({
    default: () => <div data-testid="period-filter">Period</div>,
}));

vi.mock('@/app/components/navbar/AdvancedFilters', () => ({
    default: () => <div data-testid="advanced-filters">AdvancedFilters</div>,
}));

const mockT = (key: string) => key;

describe('Search View Components', () => {
    afterEach(() => {
        cleanup();
    });

    const mockRef = React.createRef<HTMLInputElement>();

    describe('DesktopSearch', () => {
        it('renders only logo if page is not filterable', () => {
            render(
                <DesktopSearch
                    isSearchMode={false}
                    searchQuery=""
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: false, hasActive: false }}
                    isFilterablePage={false}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('logo')).toBeDefined();
            expect(screen.queryByRole('textbox')).toBeNull();
        });

        it('renders search button when filterable and not in search mode', () => {
            render(
                <DesktopSearch
                    isSearchMode={false}
                    searchQuery=""
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: false, hasActive: false }}
                    isFilterablePage={true}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('logo')).toBeDefined();
            expect(screen.getByRole('button')).toBeDefined();
        });

        it('renders form and filters when in search mode', () => {
            render(
                <DesktopSearch
                    isSearchMode={true}
                    searchQuery="avocado"
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: true, hasActive: true }}
                    isFilterablePage={true}
                    t={mockT}
                />
            );
            expect(
                screen.getByPlaceholderText('search_recipes...')
            ).toBeDefined();
            expect(screen.getByTestId('order-by-dropdown')).toBeDefined();
            expect(screen.getByTestId('period-filter')).toBeDefined();
            expect(screen.getByTestId('advanced-filters')).toBeDefined();
        });
    });

    describe('MobileSearch', () => {
        it('renders only logo if page is not filterable', () => {
            render(
                <MobileSearch
                    isSearchMode={false}
                    searchQuery=""
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: false, hasActive: false }}
                    isFilterablePage={false}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('logo')).toBeDefined();
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('renders normal mode (logo + search button) when not in search mode and page is filterable', () => {
            render(
                <MobileSearch
                    isSearchMode={false}
                    searchQuery=""
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: false, hasActive: false }}
                    isFilterablePage={true}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('logo')).toBeDefined();
            expect(screen.getByRole('button')).toBeDefined();
        });

        it('renders full search header when in search mode and page is filterable', () => {
            render(
                <MobileSearch
                    isSearchMode={true}
                    searchQuery="pasta"
                    onSearchToggle={vi.fn()}
                    onSubmit={vi.fn()}
                    onChange={vi.fn()}
                    onKeyDown={vi.fn()}
                    inputRef={mockRef}
                    filtersState={{ isFiltering: true, hasActive: true }}
                    isFilterablePage={true}
                    t={mockT}
                />
            );
            expect(
                screen.getByPlaceholderText('search_recipes...')
            ).toBeDefined();
            expect(screen.getByTestId('order-by-dropdown')).toBeDefined();
            expect(screen.getByTestId('period-filter')).toBeDefined();
            expect(screen.getByTestId('advanced-filters')).toBeDefined();
        });
    });
});
