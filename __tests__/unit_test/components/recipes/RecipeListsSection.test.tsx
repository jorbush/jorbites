import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeListsSection from '@/app/components/recipes/RecipeListsSection';
import { SafeList } from '@/app/types';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'included_in_lists') return 'Included in Lists';
            return options?.defaultValue || key;
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/components/lists/ListCard', () => ({
    ListCard: ({ list }: { list: SafeList }) => (
        <div data-testid="mock-list-card">{list.name}</div>
    ),
}));

describe('RecipeListsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockLists: SafeList[] = [
        {
            id: 'list-1',
            name: 'Favorite Pastas',
            isPrivate: false,
            isDefault: false,
            userId: 'user-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            recipes: [],
        },
        {
            id: 'list-2',
            name: 'Quick Weeknights',
            isPrivate: false,
            isDefault: false,
            userId: 'user-1',
            createdAt: '2026-01-02',
            updatedAt: '2026-01-02',
            recipes: [],
        },
    ];

    it('returns null when lists array is empty', () => {
        const { container } = render(<RecipeListsSection lists={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders section title and list cards when lists are present', () => {
        render(<RecipeListsSection lists={mockLists} />);

        expect(screen.getByTestId('recipe-lists-section')).toBeInTheDocument();
        expect(screen.getByText('Included in Lists')).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-list-card')).toHaveLength(2);
        expect(screen.getByText('Favorite Pastas')).toBeInTheDocument();
        expect(screen.getByText('Quick Weeknights')).toBeInTheDocument();
    });
});
