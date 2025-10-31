import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
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

// Mock Textarea component
vi.mock('@/app/components/inputs/Textarea', () => ({
    default: ({ id, rows, dataCy, placeholder }: any) => (
        <div data-testid={dataCy || `textarea-${id}`}>
            <textarea
                id={id}
                rows={rows}
                placeholder={placeholder}
                data-testid={`${id}-field`}
            />
        </div>
    ),
}));

// Mock ToggleSwitch component
vi.mock('@/app/components/inputs/ToggleSwitch', () => ({
    default: ({ checked, onChange, label, dataCy }: any) => (
        <div data-testid="toggle-switch-container">
            <span>{label}</span>
            <button
                data-testid="toggle-input-mode"
                data-cy={dataCy}
                onClick={onChange}
                role="switch"
                aria-checked={checked}
            >
                {checked ? 'ON' : 'OFF'}
            </button>
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
    CHAR_COUNT_WARNING_THRESHOLD: 0.8,
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

    it('renders toggle button for switching input modes', () => {
        render(<IngredientsStep {...mockProps} />);

        const toggleButton = screen.getByTestId('toggle-input-mode');
        expect(toggleButton).toBeDefined();
        expect(toggleButton.getAttribute('aria-checked')).toBe('false');
    });

    it('switches to plain text mode when toggle is clicked', () => {
        render(<IngredientsStep {...mockProps} />);

        const toggleButton = screen.getByTestId('toggle-input-mode');
        fireEvent.click(toggleButton);

        // After clicking, we should see the textarea
        expect(screen.queryByTestId('ingredients-textarea')).toBeDefined();
        // And the toggle should be checked
        expect(toggleButton.getAttribute('aria-checked')).toBe('true');
    });

    it('switches back to list mode when toggle is clicked again', () => {
        render(<IngredientsStep {...mockProps} />);

        const toggleButton = screen.getByTestId('toggle-input-mode');

        // Switch to plain text mode
        fireEvent.click(toggleButton);
        expect(screen.queryByTestId('ingredients-textarea')).toBeDefined();

        // Switch back to list mode
        fireEvent.click(toggleButton);
        expect(screen.queryByTestId('ingredients-textarea')).toBeNull();
        expect(screen.queryByTestId('recipe-ingredient-0')).toBeDefined();
    });

    it('shows help text in plain text mode', () => {
        render(<IngredientsStep {...mockProps} />);

        const toggleButton = screen.getByTestId('toggle-input-mode');
        fireEvent.click(toggleButton);

        // Check for help text
        expect(screen.getByText('paste_ingredients_help')).toBeDefined();
    });

    it('shows apply button in plain text mode', () => {
        render(<IngredientsStep {...mockProps} />);

        const toggleButton = screen.getByTestId('toggle-input-mode');
        fireEvent.click(toggleButton);

        const applyButton = screen.getByTestId('apply-ingredients-button');
        expect(applyButton).toBeDefined();
        expect(applyButton.textContent).toBe('apply');
    });

    it('calls onSetIngredients when apply is clicked with valid text', () => {
        const mockSetIngredients = vi.fn();
        const propsWithSetIngredients = {
            ...mockProps,
            onSetIngredients: mockSetIngredients,
        };

        render(<IngredientsStep {...propsWithSetIngredients} />);

        // Switch to plain text mode
        const toggleButton = screen.getByTestId('toggle-input-mode');
        fireEvent.click(toggleButton);

        // Set value in textarea
        const textarea = screen.getByTestId(
            'ingredients-plain-text-field'
        ) as HTMLTextAreaElement;
        fireEvent.change(textarea, {
            target: { value: '1. flour\n2. sugar\n3. eggs' },
        });

        // Click apply
        const applyButton = screen.getByTestId('apply-ingredients-button');
        fireEvent.click(applyButton);

        // Should call onSetIngredients with parsed array
        expect(mockSetIngredients).toHaveBeenCalledWith([
            'flour',
            'sugar',
            'eggs',
        ]);
    });
});
