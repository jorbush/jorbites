import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeStepsInputs from '@/app/components/modals/recipe-steps/RecipeStepsInputs';

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
    RECIPE_STEP_MAX_LENGTH: 500,
}));

describe('<RecipeStepsInputs />', () => {
    const mockRegister = vi.fn();
    const mockOnRemoveStep = vi.fn();

    const defaultProps = {
        numSteps: 1,
        register: mockRegister,
        errors: {},
        onRemoveStep: mockOnRemoveStep,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correct number of step inputs', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={3}
            />
        );

        expect(screen.getByTestId('recipe-step-0')).toBeDefined();
        expect(screen.getByTestId('recipe-step-1')).toBeDefined();
        expect(screen.getByTestId('recipe-step-2')).toBeDefined();
    });

    it('displays step numbers correctly starting from 1', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={3}
            />
        );

        expect(screen.getByText('1.')).toBeDefined();
        expect(screen.getByText('2.')).toBeDefined();
        expect(screen.getByText('3.')).toBeDefined();
    });

    it('sets input as required when there is only one step', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={1}
            />
        );

        const firstStepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        expect(firstStepField.required).toBe(true);
    });

    it('sets input as not required when there are multiple steps', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={2}
            />
        );

        const firstStepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        const secondStepField = screen.getByTestId(
            'step-1-field'
        ) as HTMLInputElement;

        expect(firstStepField.required).toBe(false);
        expect(secondStepField.required).toBe(false);
    });

    it('does not show remove button when there is only one step', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={1}
            />
        );

        expect(screen.queryByTestId('remove-step-button')).toBeNull();
    });

    it('shows remove button only for the last step when there are multiple steps', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={3}
            />
        );

        const removeButtons = screen.getAllByTestId('remove-step-button');
        expect(removeButtons).toHaveLength(1);
    });

    it('calls onRemoveStep with correct index when remove button is clicked', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={3}
            />
        );

        const removeButton = screen.getByTestId('remove-step-button');
        fireEvent.click(removeButton);

        expect(mockOnRemoveStep).toHaveBeenCalledWith(2);
    });

    it('sets maxLength properly from constants', () => {
        render(
            <RecipeStepsInputs
                {...defaultProps}
                numSteps={1}
            />
        );

        const firstStepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        expect(firstStepField.maxLength).toBe(500);
    });
});
