import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeStepsStep from '@/app/components/modals/recipe-steps/RecipeStepsStep';
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
    RECIPE_STEP_MAX_LENGTH: 500,
    RECIPE_MAX_STEPS: 15,
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

describe('<RecipeStepsStep />', () => {
    const mockRegister = vi.fn();
    const mockProps = {
        numSteps: 1,
        register: mockRegister,
        errors: {},
        onAddStep: vi.fn(),
        onRemoveStep: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<RecipeStepsStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('title_steps')).toBeDefined();
    });

    it('renders add step button', () => {
        render(<RecipeStepsStep {...mockProps} />);

        const addButton = screen.getByTestId('add-step-button');
        expect(addButton).toBeDefined();
        expect(addButton.textContent).toBe('+');
    });

    it('renders correct number of step inputs', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 3,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        expect(screen.getByTestId('recipe-step-0')).toBeDefined();
        expect(screen.getByTestId('recipe-step-1')).toBeDefined();
        expect(screen.getByTestId('recipe-step-2')).toBeDefined();
    });

    it('displays step numbers correctly', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 3,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        // Check that step numbers are displayed
        expect(screen.getByText('1.')).toBeDefined();
        expect(screen.getByText('2.')).toBeDefined();
        expect(screen.getByText('3.')).toBeDefined();
    });

    it('first step is required when there is only one', () => {
        render(<RecipeStepsStep {...mockProps} />);

        const firstStepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        expect(firstStepField.required).toBe(true);
    });

    it('steps are not required when there are multiple', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 2,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        const firstStepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        const secondStepField = screen.getByTestId(
            'step-1-field'
        ) as HTMLInputElement;

        expect(firstStepField.required).toBe(false);
        expect(secondStepField.required).toBe(false);
    });

    it('shows remove button only for the last step when multiple exist', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 3,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        // Only the last step should have a remove button
        expect(screen.queryByTestId('remove-step-button')).toBeDefined();

        // There should be only one remove button
        const removeButtons = screen.getAllByTestId('remove-step-button');
        expect(removeButtons).toHaveLength(1);
    });

    it('does not show remove button when there is only one step', () => {
        render(<RecipeStepsStep {...mockProps} />);

        expect(screen.queryByTestId('remove-step-button')).toBeNull();
    });

    it('calls onAddStep when add button is clicked', () => {
        render(<RecipeStepsStep {...mockProps} />);

        const addButton = screen.getByTestId('add-step-button');
        fireEvent.click(addButton);

        expect(mockProps.onAddStep).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveStep when remove button is clicked', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 2,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        const removeButton = screen.getByTestId('remove-step-button');
        fireEvent.click(removeButton);

        expect(mockProps.onRemoveStep).toHaveBeenCalledWith(1); // Last index (1)
    });

    it('shows error toast when trying to add beyond max steps', () => {
        const propsAtMaxSteps = {
            ...mockProps,
            numSteps: 15, // RECIPE_MAX_STEPS
        };

        render(<RecipeStepsStep {...propsAtMaxSteps} />);

        const addButton = screen.getByTestId('add-step-button');
        fireEvent.click(addButton);

        expect(toast.error).toHaveBeenCalledWith('max_steps_reached');
        expect(mockProps.onAddStep).not.toHaveBeenCalled();
    });

    it('allows adding steps when under the limit', () => {
        const propsUnderLimit = {
            ...mockProps,
            numSteps: 14, // One under the limit
        };

        render(<RecipeStepsStep {...propsUnderLimit} />);

        const addButton = screen.getByTestId('add-step-button');
        fireEvent.click(addButton);

        expect(mockProps.onAddStep).toHaveBeenCalledTimes(1);
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('sets correct maxLength for step inputs', () => {
        render(<RecipeStepsStep {...mockProps} />);

        const stepField = screen.getByTestId(
            'step-0-field'
        ) as HTMLInputElement;
        expect(stepField.maxLength).toBe(500);
    });

    it('has scrollable container for steps', () => {
        render(<RecipeStepsStep {...mockProps} />);

        // The steps container should have overflow-y-auto class
        // We need to go up the DOM tree to find the container that wraps all steps
        const stepElement = screen.getByTestId('recipe-step-0');
        const stepContainer =
            stepElement.parentElement?.parentElement?.parentElement;
        expect(stepContainer?.className).toContain('overflow-y-auto');
    });

    it('uses translation key for max steps error message', () => {
        const propsAtMaxSteps = {
            ...mockProps,
            numSteps: 15,
        };

        render(<RecipeStepsStep {...propsAtMaxSteps} />);

        const addButton = screen.getByTestId('add-step-button');
        fireEvent.click(addButton);

        // Should try to get translation first, fallback to english
        expect(toast.error).toHaveBeenCalledWith('max_steps_reached');
    });

    it('renders step inputs with proper layout', () => {
        const propsWithMultipleSteps = {
            ...mockProps,
            numSteps: 2,
        };

        render(<RecipeStepsStep {...propsWithMultipleSteps} />);

        // Check that each step has its container with proper classes
        // Need to go up to the wrapper div that has the flex classes
        const step1Container =
            screen.getByTestId('recipe-step-0').parentElement?.parentElement;
        const step2Container =
            screen.getByTestId('recipe-step-1').parentElement?.parentElement;

        expect(step1Container?.className).toContain('flex');
        expect(step1Container?.className).toContain('items-center');
        expect(step1Container?.className).toContain('gap-3');

        expect(step2Container?.className).toContain('flex');
        expect(step2Container?.className).toContain('items-center');
        expect(step2Container?.className).toContain('gap-3');
    });

    it('renders correct step numbers for multiple steps', () => {
        const propsWithFiveSteps = {
            ...mockProps,
            numSteps: 5,
        };

        render(<RecipeStepsStep {...propsWithFiveSteps} />);

        expect(screen.getByText('1.')).toBeDefined();
        expect(screen.getByText('2.')).toBeDefined();
        expect(screen.getByText('3.')).toBeDefined();
        expect(screen.getByText('4.')).toBeDefined();
        expect(screen.getByText('5.')).toBeDefined();
    });
});
