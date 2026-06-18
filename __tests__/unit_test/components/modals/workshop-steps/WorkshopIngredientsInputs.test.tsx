import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkshopIngredientsInputs from '@/app/components/modals/workshop-steps/WorkshopIngredientsInputs';

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

// Mock constants
vi.mock('@/app/utils/constants', () => ({
    WORKSHOP_INGREDIENT_MAX_LENGTH: 150,
}));

describe('<WorkshopIngredientsInputs />', () => {
    const mockRegister = vi.fn();
    const mockOnRemoveIngredient = vi.fn();

    const defaultProps = {
        numIngredients: 1,
        register: mockRegister,
        errors: {},
        onRemoveIngredient: mockOnRemoveIngredient,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correct number of ingredient inputs', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={3}
            />
        );

        expect(screen.getByTestId('workshop-ingredient-0')).toBeDefined();
        expect(screen.getByTestId('workshop-ingredient-1')).toBeDefined();
        expect(screen.getByTestId('workshop-ingredient-2')).toBeDefined();
    });

    it('sets input as required when there is only one ingredient', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={1}
            />
        );

        const firstField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        expect(firstField.required).toBe(true);
    });

    it('sets input as not required when there are multiple ingredients', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={2}
            />
        );

        const firstField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        const secondField = screen.getByTestId(
            'ingredient-1-field'
        ) as HTMLInputElement;

        expect(firstField.required).toBe(false);
        expect(secondField.required).toBe(false);
    });

    it('shows remove button only for the last ingredient when there are multiple ingredients', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={3}
            />
        );

        const removeButtons = screen.getAllByTestId('remove-ingredient-button');
        expect(removeButtons).toHaveLength(1);
    });

    it('calls onRemoveIngredient with correct index when remove button is clicked', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={3}
            />
        );

        const removeButton = screen.getByTestId('remove-ingredient-button');
        fireEvent.click(removeButton);

        expect(mockOnRemoveIngredient).toHaveBeenCalledWith(2);
    });

    it('sets maxLength properly from constants', () => {
        render(
            <WorkshopIngredientsInputs
                {...defaultProps}
                numIngredients={1}
            />
        );

        const firstField = screen.getByTestId(
            'ingredient-0-field'
        ) as HTMLInputElement;
        expect(firstField.maxLength).toBe(150);
    });
});
