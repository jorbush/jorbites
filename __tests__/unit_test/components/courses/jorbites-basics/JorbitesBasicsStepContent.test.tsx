import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import JorbitesBasicsStepContent from '@/app/courses/jorbites-basics/steps/JorbitesBasicsStepContent';
import React from 'react';

// Mock child step components
vi.mock('@/app/courses/jorbites-basics/JorbitesBasicsOverview', () => ({
    default: () => <div data-testid="step-overview">StepOverview</div>,
}));
vi.mock(
    '@/app/courses/jorbites-basics/steps/JorbitesBasicsWorkflowStep',
    () => ({
        default: () => <div data-testid="step-workflow">StepWorkflow</div>,
    })
);
vi.mock(
    '@/app/courses/jorbites-basics/steps/JorbitesBasicsInteractionsStep',
    () => ({
        default: () => (
            <div data-testid="step-interactions">StepInteractions</div>
        ),
    })
);
vi.mock(
    '@/app/courses/jorbites-basics/steps/JorbitesBasicsSettingsStep',
    () => ({
        default: () => <div data-testid="step-settings">StepSettings</div>,
    })
);
vi.mock('@/app/courses/jorbites-basics/steps/JorbitesBasicsPwaStep', () => ({
    default: () => <div data-testid="step-pwa">StepPwa</div>,
}));
vi.mock('@/app/courses/jorbites-basics/steps/JorbitesBasicsTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('JorbitesBasicsStepContent', () => {
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
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="interactions"
            />
        );
        expect(screen.getByTestId('step-interactions')).toBeDefined();

        rerender(
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="settings"
            />
        );
        expect(screen.getByTestId('step-settings')).toBeDefined();

        rerender(
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="pwa"
            />
        );
        expect(screen.getByTestId('step-pwa')).toBeDefined();

        rerender(
            <JorbitesBasicsStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
