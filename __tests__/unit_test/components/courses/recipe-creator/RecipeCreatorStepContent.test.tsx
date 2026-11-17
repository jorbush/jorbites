import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeCreatorStepContent from '@/app/courses/recipe-creator/RecipeCreatorStepContent';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock child step components
vi.mock('@/app/courses/recipe-creator/RecipeCreatorOverview', () => ({
    default: () => <div data-testid="step-overview">StepOverview</div>,
}));
vi.mock('@/app/components/courses/steps/CourseWorkflowStep', () => ({
    default: () => <div data-testid="step-workflow">StepWorkflow</div>,
}));
vi.mock('@/app/components/courses/steps/CourseInfoStep', () => ({
    default: (props: { title: string }) => (
        <div data-testid={`step-info-${props.title}`}>{props.title}</div>
    ),
}));
vi.mock('@/app/courses/recipe-creator/RecipeCreatorTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('RecipeCreatorStepContent', () => {
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
            <RecipeCreatorStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <RecipeCreatorStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <RecipeCreatorStepContent
                {...defaultProps}
                activeStep="plaintext"
            />
        );
        expect(
            screen.getByTestId(
                'step-info-recipe_creator_course_details.plaintext_info_title'
            )
        ).toBeDefined();

        rerender(
            <RecipeCreatorStepContent
                {...defaultProps}
                activeStep="drafts"
            />
        );
        expect(
            screen.getByTestId(
                'step-info-recipe_creator_course_details.drafts_info_title'
            )
        ).toBeDefined();

        rerender(
            <RecipeCreatorStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
