import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import JorbitesBasicsTestStep from '@/app/courses/jorbites-basics/steps/JorbitesBasicsTestStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock CourseTest
vi.mock('@/app/components/courses/core/CourseTest', () => ({
    default: (props: any) => (
        <div data-testid="mock-course-test">{props.description}</div>
    ),
}));

// Mock CourseCompleted
vi.mock('@/app/components/courses/steps/CourseCompleted', () => ({
    default: (props: any) => (
        <div data-testid="mock-course-completed">
            Completed: {props.courseTitle} - {props.currentUserNames}
        </div>
    ),
}));

describe('JorbitesBasicsTestStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders CourseTest component when test is not yet passed', () => {
        const onPassMock = vi.fn();
        render(
            <JorbitesBasicsTestStep
                isTestPassed={false}
                currentUser={null}
                onPass={onPassMock}
            />
        );

        expect(screen.getByTestId('mock-course-test')).toBeDefined();
        expect(
            screen.getByText(
                'jorbites_basics_course_details.final_test_description'
            )
        ).toBeDefined();
        expect(screen.queryByTestId('mock-course-completed')).toBeNull();
    });

    it('renders CourseCompleted component when test is passed', () => {
        const onPassMock = vi.fn();
        render(
            <JorbitesBasicsTestStep
                isTestPassed={true}
                currentUser={{ name: 'Jordi' } as any}
                onPass={onPassMock}
            />
        );

        expect(screen.queryByTestId('mock-course-test')).toBeNull();
        expect(screen.getByTestId('mock-course-completed')).toBeDefined();
        expect(
            screen.getByText('Completed: Jorbites Basics Certificate - Jordi')
        ).toBeDefined();
    });
});
