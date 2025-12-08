import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EmptyState from '@/app/components/utils/EmptyState';
import React from 'react';

const pushMock = vi.fn();
const mockSearchParams = new URLSearchParams();

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    useSearchParams: () => mockSearchParams,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key.toLowerCase().replace(/ /g, '_'),
    }),
}));

describe('<EmptyState />', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        // Clear search params before each test
        mockSearchParams.delete('search');
        mockSearchParams.delete('category');
    });
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders with default props (no search params)', () => {
        render(<EmptyState />);

        expect(screen.getByText('No exact matches')).toBeDefined();
        expect(
            screen.getByText('Try changing or removing some of your filters.')
        ).toBeDefined();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders with custom title and subtitle', () => {
        const customTitle = 'Custom Title';
        const customSubtitle = 'Custom Subtitle';

        render(
            <EmptyState
                title={customTitle}
                subtitle={customSubtitle}
            />
        );

        expect(screen.getByText(customTitle)).toBeDefined();
        expect(screen.getByText(customSubtitle)).toBeDefined();
    });

    it('renders reset button when showReset is true and filters are present', () => {
        mockSearchParams.set('category', 'desserts');
        render(<EmptyState showReset={true} />);

        const resetButton = screen.getByRole('button');
        expect(resetButton).toBeDefined();
    });

    it('calls router.push when reset button is clicked', () => {
        mockSearchParams.set('search', 'test');
        render(<EmptyState showReset={true} />);

        const resetButton = screen.getByRole('button');
        fireEvent.click(resetButton);

        expect(pushMock).toHaveBeenCalledWith('/');
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

    it('does not render reset button when showReset is false', () => {
        render(<EmptyState showReset={false} />);

        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders search-specific content when search param is present', () => {
        mockSearchParams.set('search', 'test recipe');

        render(<EmptyState showReset={true} />);

        expect(screen.getByText('no_recipes_found')).toBeDefined();
        expect(screen.getByText('no_search_results_subtitle')).toBeDefined();

        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeDefined();
    });

    it('renders search with category content when both search and category params are present', () => {
        mockSearchParams.set('search', 'test recipe');
        mockSearchParams.set('category', 'desserts');

        render(<EmptyState showReset={true} />);

        expect(screen.getByText('no_recipes_found')).toBeDefined();
        expect(screen.getByText('no_search_category_results')).toBeDefined();

        const resetButton = screen.getByRole('button');
        expect(resetButton).toBeDefined();
    });
});
