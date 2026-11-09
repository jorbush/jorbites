import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MealPlannerStepContent from '@/app/courses/meal-planner/steps/MealPlannerStepContent';
import React from 'react';

// Mock child step components
vi.mock('@/app/courses/meal-planner/MealPlannerOverview', () => ({
    default: () => <div data-testid="step-overview">StepOverview</div>,
}));
vi.mock('@/app/courses/meal-planner/steps/MealPlannerWorkflowStep', () => ({
    default: () => <div data-testid="step-workflow">StepWorkflow</div>,
}));
vi.mock('@/app/courses/meal-planner/steps/MealPlannerSlotsStep', () => ({
    default: () => <div data-testid="step-slots">StepSlots</div>,
}));
vi.mock('@/app/courses/meal-planner/steps/MealPlannerExportsStep', () => ({
    default: () => <div data-testid="step-exports">StepExports</div>,
}));
vi.mock('@/app/courses/meal-planner/steps/MealPlannerTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('MealPlannerStepContent', () => {
    afterEach(() => {
        cleanup();
    });

    const defaultProps = {
        completedModules: {},
        markModuleCompleted: vi.fn(),
        setActiveStep: vi.fn(),
        isTestPassed: false,
        currentUser: null,
    };

    it('renders the correct component for each active step', () => {
        const { rerender } = render(
            <MealPlannerStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <MealPlannerStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <MealPlannerStepContent
                {...defaultProps}
                activeStep="slots"
            />
        );
        expect(screen.getByTestId('step-slots')).toBeDefined();

        rerender(
            <MealPlannerStepContent
                {...defaultProps}
                activeStep="exports"
            />
        );
        expect(screen.getByTestId('step-exports')).toBeDefined();

        rerender(
            <MealPlannerStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
