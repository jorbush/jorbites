import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeBookStepContent from '@/app/courses/recipe-book-builder/steps/RecipeBookStepContent';
import React from 'react';

// Mock child step components
vi.mock('@/app/courses/recipe-book-builder/RecipeBookOverview', () => ({
    default: () => <div data-testid="step-requirements">StepRequirements</div>,
}));
vi.mock(
    '@/app/courses/recipe-book-builder/steps/RecipeBookWorkflowStep',
    () => ({
        default: () => <div data-testid="step-workflow">StepWorkflow</div>,
    })
);
vi.mock('@/app/courses/recipe-book-builder/steps/RecipeBookStylesStep', () => ({
    default: () => <div data-testid="step-styles">StepStyles</div>,
}));
vi.mock(
    '@/app/courses/recipe-book-builder/steps/RecipeBookSelectionStep',
    () => ({
        default: () => <div data-testid="step-selection">StepSelection</div>,
    })
);
vi.mock('@/app/courses/recipe-book-builder/steps/RecipeBookTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('RecipeBookStepContent', () => {
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
            <RecipeBookStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-requirements')).toBeDefined();

        rerender(
            <RecipeBookStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <RecipeBookStepContent
                {...defaultProps}
                activeStep="styles"
            />
        );
        expect(screen.getByTestId('step-styles')).toBeDefined();

        rerender(
            <RecipeBookStepContent
                {...defaultProps}
                activeStep="selection"
            />
        );
        expect(screen.getByTestId('step-selection')).toBeDefined();

        rerender(
            <RecipeBookStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
