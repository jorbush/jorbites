import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopsStepContent from '@/app/courses/workshops/WorkshopsStepContent';
import React from 'react';

// Mock child step components
vi.mock('@/app/courses/workshops/WorkshopsOverview', () => ({
    default: () => <div data-testid="step-overview">StepOverview</div>,
}));
vi.mock('@/app/courses/workshops/WorkshopsWorkflowStep', () => ({
    default: () => <div data-testid="step-workflow">StepWorkflow</div>,
}));
vi.mock('@/app/courses/workshops/WorkshopsWhitelistStep', () => ({
    default: () => <div data-testid="step-whitelist">StepWhitelist</div>,
}));
vi.mock('@/app/courses/workshops/WorkshopsApprovalsStep', () => ({
    default: () => <div data-testid="step-approvals">StepApprovals</div>,
}));
vi.mock('@/app/courses/workshops/WorkshopsTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('WorkshopsStepContent', () => {
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
            <WorkshopsStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <WorkshopsStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <WorkshopsStepContent
                {...defaultProps}
                activeStep="whitelist"
            />
        );
        expect(screen.getByTestId('step-whitelist')).toBeDefined();

        rerender(
            <WorkshopsStepContent
                {...defaultProps}
                activeStep="approvals"
            />
        );
        expect(screen.getByTestId('step-approvals')).toBeDefined();

        rerender(
            <WorkshopsStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
