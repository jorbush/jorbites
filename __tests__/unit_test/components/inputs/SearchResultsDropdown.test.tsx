import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SearchResultsDropdown from '@/app/components/inputs/SearchResultsDropdown';

// Mock for Avatar
vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

// Mock for VerificationBadge
vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <span data-testid="verification-badge" />,
}));

describe('<SearchResultsDropdown />', () => {
    afterEach(() => {
        cleanup();
    });

    const mockUsers = [
        { id: 'u1', name: 'User One', level: 1 },
        { id: 'u2', name: 'User Two', level: 2 },
    ];

    it('renders empty message when hasResults is false', () => {
        render(
            <SearchResultsDropdown
                searchResults={[]}
                searchType="users"
                hasResults={false}
                emptyMessage="Nothing here"
            />
        );

        expect(screen.getByText('Nothing here')).toBeDefined();
    });

    it('renders search results when hasResults is true', () => {
        render(
            <SearchResultsDropdown
                searchResults={mockUsers}
                searchType="users"
                hasResults={true}
                emptyMessage="Nothing here"
            />
        );

        expect(screen.getByText('User One')).toBeDefined();
        expect(screen.getByText('User Two')).toBeDefined();
    });

    it('disables remaining items when maxSelected threshold is reached', () => {
        const isSelected = (id: string) => id === 'u1';

        render(
            <SearchResultsDropdown
                searchResults={mockUsers}
                searchType="users"
                hasResults={true}
                emptyMessage="Nothing here"
                isSelected={isSelected}
                maxSelected={1}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0].hasAttribute('disabled')).toBe(true);
        expect(buttons[1].hasAttribute('disabled')).toBe(true);
    });

    it('propagates select events to onSelectResult', () => {
        const mockSelect = vi.fn();

        render(
            <SearchResultsDropdown
                searchResults={mockUsers}
                searchType="users"
                hasResults={true}
                emptyMessage="Nothing here"
                onSelectResult={mockSelect}
            />
        );

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(mockSelect).toHaveBeenCalledWith(mockUsers[0]);
    });
});
