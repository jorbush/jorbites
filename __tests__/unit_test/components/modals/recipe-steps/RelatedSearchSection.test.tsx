import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RelatedSearchSection from '@/app/components/modals/recipe-steps/RelatedSearchSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/inputs/SearchInput', () => ({
    default: ({ label, value, onChange, onSelectResult }: any) => (
        <div data-testid="search-input">
            <label>{label}</label>
            <input
                data-testid="search-input-field"
                value={value}
                onChange={onChange}
            />
            <button
                data-testid="mock-select-btn"
                onClick={() =>
                    onSelectResult({ id: 'item-1', title: 'Item 1' })
                }
            >
                Select
            </button>
        </div>
    ),
}));

describe('RelatedSearchSection', () => {
    const defaultProps = {
        searchType: 'recipes' as const,
        searchQuery: '',
        setSearchQuery: vi.fn(),
        searchResults: { recipes: [], quests: [] },
        isLoading: false,
        selectedLinkedRecipes: [],
        selectedQuest: null,
        onAddLinkedRecipe: vi.fn(),
        onSelectQuest: vi.fn(),
    };

    it('renders recipe search label and handles search query changes', () => {
        render(<RelatedSearchSection {...defaultProps} />);

        expect(screen.getByText('search_recipes')).toBeInTheDocument();
        const input = screen.getByTestId('search-input-field');
        fireEvent.change(input, { target: { value: 'pasta' } });
        expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('pasta');
    });

    it('handles selecting recipe', () => {
        render(<RelatedSearchSection {...defaultProps} />);

        const btn = screen.getByTestId('mock-select-btn');
        fireEvent.click(btn);
        expect(defaultProps.onAddLinkedRecipe).toHaveBeenCalledWith({
            id: 'item-1',
            title: 'Item 1',
        });
        expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('');
    });

    it('renders quest search label and handles selecting quest', () => {
        render(
            <RelatedSearchSection
                {...defaultProps}
                searchType="quests"
            />
        );

        expect(screen.getByText('search_quests')).toBeInTheDocument();
        const btn = screen.getByTestId('mock-select-btn');
        fireEvent.click(btn);
        expect(defaultProps.onSelectQuest).toHaveBeenCalledWith({
            id: 'item-1',
            title: 'Item 1',
        });
        expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('');
    });
});
