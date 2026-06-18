import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkshopPreviousStepsInputs from '@/app/components/modals/workshop-steps/WorkshopPreviousStepsInputs';

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
    WORKSHOP_STEP_MAX_LENGTH: 200,
}));

describe('<WorkshopPreviousStepsInputs />', () => {
    const mockRegister = vi.fn();
    const mockOnRemovePreviousStep = vi.fn();

    const defaultProps = {
        numPreviousSteps: 1,
        register: mockRegister,
        errors: {},
        onRemovePreviousStep: mockOnRemovePreviousStep,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correct number of step inputs', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={3}
            />
        );

        expect(screen.getByTestId('workshop-previous-step-0')).toBeDefined();
        expect(screen.getByTestId('workshop-previous-step-1')).toBeDefined();
        expect(screen.getByTestId('workshop-previous-step-2')).toBeDefined();
    });

    it('sets input as required when there is only one step', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={1}
            />
        );

        const firstStepField = screen.getByTestId(
            'previousStep-0-field'
        ) as HTMLInputElement;
        expect(firstStepField.required).toBe(true);
    });

    it('sets input as not required when there are multiple steps', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={2}
            />
        );

        const firstStepField = screen.getByTestId(
            'previousStep-0-field'
        ) as HTMLInputElement;
        const secondStepField = screen.getByTestId(
            'previousStep-1-field'
        ) as HTMLInputElement;

        expect(firstStepField.required).toBe(false);
        expect(secondStepField.required).toBe(false);
    });

    it('shows remove button only for the last step when there are multiple steps', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={3}
            />
        );

        const removeButtons = screen.getAllByTestId(
            'remove-previous-step-button'
        );
        expect(removeButtons).toHaveLength(1);
    });

    it('calls onRemovePreviousStep with correct index when remove button is clicked', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={3}
            />
        );

        const removeButton = screen.getByTestId('remove-previous-step-button');
        fireEvent.click(removeButton);

        expect(mockOnRemovePreviousStep).toHaveBeenCalledWith(2);
    });

    it('sets maxLength properly from constants', () => {
        render(
            <WorkshopPreviousStepsInputs
                {...defaultProps}
                numPreviousSteps={1}
            />
        );

        const firstStepField = screen.getByTestId(
            'previousStep-0-field'
        ) as HTMLInputElement;
        expect(firstStepField.maxLength).toBe(200);
    });
});
