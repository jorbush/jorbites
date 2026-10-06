import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsStepContent from '@/app/components/courses/drafts/steps/DraftsStepContent';
import React from 'react';

// Mock child step components
vi.mock('@/app/components/courses/drafts/DraftsCourseOverview', () => ({
    default: () => <div data-testid="step-overview">StepOverview</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsWorkflowStep', () => ({
    default: () => <div data-testid="step-workflow">StepWorkflow</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsInvitesStep', () => ({
    default: () => <div data-testid="step-invites">StepInvites</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsRolesStep', () => ({
    default: () => <div data-testid="step-roles">StepRoles</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsLockingStep', () => ({
    default: () => <div data-testid="step-locking">StepLocking</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsSyncStep', () => ({
    default: () => <div data-testid="step-sync">StepSync</div>,
}));
vi.mock('@/app/components/courses/drafts/steps/DraftsTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('DraftsStepContent', () => {
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
            <DraftsStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="invites"
            />
        );
        expect(screen.getByTestId('step-invites')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="roles"
            />
        );
        expect(screen.getByTestId('step-roles')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="locking"
            />
        );
        expect(screen.getByTestId('step-locking')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="sync"
            />
        );
        expect(screen.getByTestId('step-sync')).toBeDefined();

        rerender(
            <DraftsStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
