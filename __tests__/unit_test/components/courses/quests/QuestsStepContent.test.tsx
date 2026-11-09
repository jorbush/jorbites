import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import QuestsStepContent from '@/app/courses/quests/QuestsStepContent';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock child step components
vi.mock('@/app/courses/quests/QuestsOverview', () => ({
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
vi.mock('@/app/courses/quests/QuestsTestStep', () => ({
    default: () => <div data-testid="step-test">StepTest</div>,
}));

describe('QuestsStepContent', () => {
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
            <QuestsStepContent
                {...defaultProps}
                activeStep="requirements"
            />
        );
        expect(screen.getByTestId('step-overview')).toBeDefined();

        rerender(
            <QuestsStepContent
                {...defaultProps}
                activeStep="workflow"
            />
        );
        expect(screen.getByTestId('step-workflow')).toBeDefined();

        rerender(
            <QuestsStepContent
                {...defaultProps}
                activeStep="linking"
            />
        );
        expect(
            screen.getByTestId(
                'step-info-quests_course_details.linking_info_title'
            )
        ).toBeDefined();

        rerender(
            <QuestsStepContent
                {...defaultProps}
                activeStep="statuses"
            />
        );
        expect(
            screen.getByTestId(
                'step-info-quests_course_details.status_info_title'
            )
        ).toBeDefined();

        rerender(
            <QuestsStepContent
                {...defaultProps}
                activeStep="test"
            />
        );
        expect(screen.getByTestId('step-test')).toBeDefined();
    });
});
