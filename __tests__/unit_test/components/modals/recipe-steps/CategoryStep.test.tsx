import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CategoryStep from '@/app/components/modals/recipe-steps/CategoryStep';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
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
});
