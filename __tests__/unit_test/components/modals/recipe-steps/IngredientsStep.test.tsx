import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
        </div>
    ),
}));

// Mock Input component
vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ id, required, maxLength, dataCy }: any) => (
        <div data-testid={dataCy || `input-${id}`}>
            <input
                id={id}
                required={required}
                maxLength={maxLength}
                data-testid={`${id}-field`}
            />
        </div>
    ),
}));

// Mock Button component
vi.mock('@/app/components/buttons/Button', () => ({
    default: ({ label, onClick, dataCy }: any) => (
        <button
            data-testid={dataCy}
            onClick={onClick}
        >
            {label}
        </button>
    ),
}));

// Mock constants
vi.mock('@/app/utils/constants', () => ({
    RECIPE_INGREDIENT_MAX_LENGTH: 200,
    RECIPE_MAX_INGREDIENTS: 20,
}));

// Mock AiFillDelete icon
vi.mock('react-icons/ai', () => ({
    AiFillDelete: ({ onClick, size, color, className, ...props }: any) => (
        <button
            data-testid={props['data-testid']}
            onClick={onClick}
            className={className}
            style={{ fontSize: size, color }}
        >
            Delete
        </button>
    ),
}));

describe('<IngredientsStep />', () => {
    const mockRegister = vi.fn();
    const mockProps = {
        numIngredients: 1,
        register: mockRegister,
        errors: {},
        onAddIngredient: vi.fn(),
        onRemoveIngredient: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<IngredientsStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('title_ingredients')).toBeDefined();
    });

    it('renders add ingredient button', () => {
        render(<IngredientsStep {...mockProps} />);

        const addButton = screen.getByTestId('add-ingredient-button');
        expect(addButton).toBeDefined();
        expect(addButton.textContent).toBe('+');
    });

    it('renders correct number of ingredient inputs', () => {
        const propsWithMultipleIngredients = {
            ...mockProps,
            numIngredients: 3,
        };

        render(<IngredientsStep {...propsWithMultipleIngredients} />);

        expect(screen.getByTestId('recipe-ingredient-0')).toBeDefined();
        expect(screen.getByTestId('recipe-ingredient-1')).toBeDefined();
        expect(screen.getByTestId('recipe-ingredient-2')).toBeDefined();
    });

    it('first ingredient is required when there is only one', () => {
        render(<IngredientsStep {...mockProps} />);

        const firstIngredientField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        expect(firstIngredientField.required).toBe(true);
    });

    it('ingredients are not required when there are multiple', () => {
        const propsWithMultipleIngredients = {
            ...mockProps,
            numIngredients: 2,
        };

        render(<IngredientsStep {...propsWithMultipleIngredients} />);

        const firstIngredientField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        const secondIngredientField = screen.getByTestId(
            'ingredient-1-field'
        ) as HTMLInputElement;

        expect(firstIngredientField.required).toBe(false);
        expect(secondIngredientField.required).toBe(false);
    });

    it('shows remove button only for the last ingredient when multiple exist', () => {
        const propsWithMultipleIngredients = {
            ...mockProps,
            numIngredients: 3,
        };

        render(<IngredientsStep {...propsWithMultipleIngredients} />);

        // Only the last ingredient should have a remove button
        expect(screen.queryByTestId('remove-ingredient-button')).toBeDefined();

        // There should be only one remove button
        const removeButtons = screen.getAllByTestId('remove-ingredient-button');
        expect(removeButtons).toHaveLength(1);
    });

    it('does not show remove button when there is only one ingredient', () => {
        render(<IngredientsStep {...mockProps} />);

        expect(screen.queryByTestId('remove-ingredient-button')).toBeNull();
    });

    it('calls onAddIngredient when add button is clicked', () => {
        render(<IngredientsStep {...mockProps} />);

        const addButton = screen.getByTestId('add-ingredient-button');
        fireEvent.click(addButton);

        expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveIngredient when remove button is clicked', () => {
        const propsWithMultipleIngredients = {
            ...mockProps,
            numIngredients: 2,
        };

        render(<IngredientsStep {...propsWithMultipleIngredients} />);

        const removeButton = screen.getByTestId('remove-ingredient-button');
        fireEvent.click(removeButton);

        expect(mockProps.onRemoveIngredient).toHaveBeenCalledWith(1); // Last index (1)
    });

    it('shows error toast when trying to add beyond max ingredients', () => {
        const propsAtMaxIngredients = {
            ...mockProps,
            numIngredients: 20, // RECIPE_MAX_INGREDIENTS
        };

        render(<IngredientsStep {...propsAtMaxIngredients} />);

        const addButton = screen.getByTestId('add-ingredient-button');
        fireEvent.click(addButton);

        expect(toast.error).toHaveBeenCalledWith('max_ingredients_reached');
        expect(mockProps.onAddIngredient).not.toHaveBeenCalled();
    });

    it('allows adding ingredients when under the limit', () => {
        const propsUnderLimit = {
            ...mockProps,
            numIngredients: 19, // One under the limit
        };

        render(<IngredientsStep {...propsUnderLimit} />);

        const addButton = screen.getByTestId('add-ingredient-button');
        fireEvent.click(addButton);

        expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('sets correct maxLength for ingredient inputs', () => {
        render(<IngredientsStep {...mockProps} />);

        const ingredientField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        expect(ingredientField.maxLength).toBe(200);
    });

    it('has scrollable container for ingredients', () => {
        render(<IngredientsStep {...mockProps} />);

        // The ingredients container should have overflow-y-auto class
        // We need to go up the DOM tree to find the container that wraps all ingredients
        const ingredientElement = screen.getByTestId('recipe-ingredient-0');
        const ingredientContainer =
            ingredientElement.parentElement?.parentElement?.parentElement;
        expect(ingredientContainer?.className).toContain('overflow-y-auto');
    });

    it('uses translation key for max ingredients error message', () => {
        const propsAtMaxIngredients = {
            ...mockProps,
            numIngredients: 20,
        };

        render(<IngredientsStep {...propsAtMaxIngredients} />);

        const addButton = screen.getByTestId('add-ingredient-button');
        fireEvent.click(addButton);

        // Should try to get translation first, fallback to english
        expect(toast.error).toHaveBeenCalledWith('max_ingredients_reached');
    });
});
