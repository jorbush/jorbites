import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CategoryStep from '@/app/components/modals/recipe-steps/CategoryStep';
import { toast } from 'react-hot-toast';
import { RECIPE_MAX_CATEGORIES } from '@/app/utils/constants';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

// Mock CategoryInput component
vi.mock('@/app/components/inputs/CategoryInput', () => ({
    default: ({ onClick, selected, label, dataCy }: any) => (
        <div
            data-testid={dataCy}
            data-selected={selected}
            onClick={() => onClick(label)}
            className={selected ? 'selected' : ''}
        >
            {label}
        </div>
    ),
}));

// Mock categories from navbar
vi.mock('@/app/components/navbar/Categories', () => ({
    categories: [
        { label: 'breakfast', icon: 'BreakfastIcon' },
        { label: 'lunch', icon: 'LunchIcon' },
        { label: 'dinner', icon: 'DinnerIcon' },
        { label: 'dessert', icon: 'DessertIcon' },
        { label: 'award-winning', icon: 'AwardIcon' }, // This should be filtered out
    ],
}));

describe('<CategoryStep />', () => {
    const mockProps = {
        selectedCategories: [] as string[],
        onCategorySelect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<CategoryStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('title_category_recipe')).toBeDefined();
    });

    it('renders all categories except award-winning', () => {
        render(<CategoryStep {...mockProps} />);

        // Should render categories
        expect(screen.getByTestId('category-box-breakfast')).toBeDefined();
        expect(screen.getByTestId('category-box-lunch')).toBeDefined();
        expect(screen.getByTestId('category-box-dinner')).toBeDefined();
        expect(screen.getByTestId('category-box-dessert')).toBeDefined();

        // Should NOT render award-winning category
        expect(screen.queryByTestId('category-box-award-winning')).toBeNull();
    });

    it('shows selected category correctly', () => {
        const propsWithSelection = {
            ...mockProps,
            selectedCategories: ['breakfast'],
        };

        render(<CategoryStep {...propsWithSelection} />);

        const breakfastCategory = screen.getByTestId('category-box-breakfast');
        const lunchCategory = screen.getByTestId('category-box-lunch');

        expect(breakfastCategory.getAttribute('data-selected')).toBe('true');
        expect(lunchCategory.getAttribute('data-selected')).toBe('false');
    });

    it('calls onCategorySelect when a category is clicked', () => {
        render(<CategoryStep {...mockProps} />);

        const breakfastCategory = screen.getByTestId('category-box-breakfast');
        fireEvent.click(breakfastCategory);

        expect(mockProps.onCategorySelect).toHaveBeenCalledWith(['breakfast']);
    });

    it('calls onCategorySelect for different categories', () => {
        render(<CategoryStep {...mockProps} />);

        const dinnerCategory = screen.getByTestId('category-box-dinner');
        fireEvent.click(dinnerCategory);

        expect(mockProps.onCategorySelect).toHaveBeenCalledWith(['dinner']);
    });

    it('allows selecting multiple categories', () => {
        const propsWithSelection = {
            ...mockProps,
            selectedCategories: ['breakfast'],
        };

        render(<CategoryStep {...propsWithSelection} />);

        const lunchCategory = screen.getByTestId('category-box-lunch');
        fireEvent.click(lunchCategory);

        expect(mockProps.onCategorySelect).toHaveBeenCalledWith([
            'breakfast',
            'lunch',
        ]);
    });

    it('allows deselecting a category', () => {
        const propsWithSelection = {
            ...mockProps,
            selectedCategories: ['breakfast', 'lunch'],
        };

        render(<CategoryStep {...propsWithSelection} />);

        const breakfastCategory = screen.getByTestId('category-box-breakfast');
        fireEvent.click(breakfastCategory);

        expect(mockProps.onCategorySelect).toHaveBeenCalledWith(['lunch']);
    });

    it('renders categories in grid layout', () => {
        render(<CategoryStep {...mockProps} />);

        // Check that the grid container exists
        const gridContainer = screen.getByTestId('category-box-breakfast')
            .parentElement?.parentElement;
        expect(gridContainer?.className).toContain('grid');
    });

    it('filters out award-winning category from the list', () => {
        render(<CategoryStep {...mockProps} />);

        // Count visible categories (should be 4, not 5)
        const categoryElements = screen.getAllByText(
            /breakfast|lunch|dinner|dessert/
        );
        expect(categoryElements).toHaveLength(4);

        // Ensure award-winning is not present
        expect(screen.queryByText('award-winning')).toBeNull();
    });

    it('prevents selecting more than max categories and shows toast error', () => {
        const propsWithMaxCategories = {
            ...mockProps,
            selectedCategories: ['breakfast', 'lunch', 'dinner'], // Already at max (3)
        };

        render(<CategoryStep {...propsWithMaxCategories} />);

        const dessertCategory = screen.getByTestId('category-box-dessert');
        fireEvent.click(dessertCategory);

        // Verify toast.error was called with the correct message
        // The translation function returns the key, so it will be 'max_categories_reached'
        // or the fallback message
        expect(toast.error).toHaveBeenCalledWith(
            expect.stringMatching(
                /max_categories_reached|Maximum of \d+ categories allowed/
            )
        );

        // Verify onCategorySelect was NOT called (category was not added)
        expect(mockProps.onCategorySelect).not.toHaveBeenCalled();
    });

    it('shows correct counter in subtitle', () => {
        const propsWithSelection = {
            ...mockProps,
            selectedCategories: ['breakfast', 'lunch'],
        };

        render(<CategoryStep {...propsWithSelection} />);

        // Check that the heading contains the counter
        const heading = screen.getByTestId('heading');
        const subtitleText = heading.querySelector('p')?.textContent || '';

        expect(subtitleText).toContain('2/3');
        expect(subtitleText).toContain(
            `${propsWithSelection.selectedCategories.length}/${RECIPE_MAX_CATEGORIES}`
        );
    });
});
