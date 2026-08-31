import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecentSearches from '@/app/components/navbar/RecentSearches';

describe('RecentSearches Component', () => {
    let defaultProps: {
        recentSearches: string[];
        onSelectSearch: any;
        onRemoveSearch: any;
        onClearAll: any;
        t: (key: string) => string;
    };

    beforeEach(() => {
        defaultProps = {
            recentSearches: ['pizza', 'paella'],
            onSelectSearch: vi.fn(),
            onRemoveSearch: vi.fn(),
            onClearAll: vi.fn(),
            t: (key: string) => key,
        };
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when recentSearches array is empty', () => {
        const { container } = render(
            <RecentSearches {...defaultProps} recentSearches={[]} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders recent searches container with chips and clear all button', () => {
        render(<RecentSearches {...defaultProps} />);

        expect(
            screen.getByTestId('recent-searches-container')
        ).toBeDefined();
        expect(screen.getByText('pizza')).toBeDefined();
        expect(screen.getByText('paella')).toBeDefined();
        expect(
            screen.getByTestId('clear-all-recent-searches')
        ).toBeDefined();
    });

    it('calls onSelectSearch when a search chip is clicked', () => {
        render(<RecentSearches {...defaultProps} />);

        fireEvent.click(screen.getByText('pizza'));
        expect(defaultProps.onSelectSearch).toHaveBeenCalledWith('pizza');
    });

    it('calls onRemoveSearch when a remove chip button is clicked', () => {
        render(<RecentSearches {...defaultProps} />);

        const removeBtn = screen.getByTestId('remove-recent-search-paella');
        fireEvent.click(removeBtn);
        expect(defaultProps.onRemoveSearch).toHaveBeenCalledWith(
            'paella',
            expect.anything()
        );
    });

    it('calls onClearAll when Clear all button is clicked', () => {
        render(<RecentSearches {...defaultProps} />);

        fireEvent.click(screen.getByTestId('clear-all-recent-searches'));
        expect(defaultProps.onClearAll).toHaveBeenCalled();
    });
});
