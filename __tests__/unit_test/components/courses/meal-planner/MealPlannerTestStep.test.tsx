import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MealPlannerTestStep from '@/app/courses/meal-planner/steps/MealPlannerTestStep';
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

describe('MealPlannerTestStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders CourseTest component when test is not yet passed', () => {
        const onPassMock = vi.fn();
        render(
            <MealPlannerTestStep
                isTestPassed={false}
                currentUser={null}
                onPass={onPassMock}
            />
        );

        expect(screen.getByTestId('mock-course-test')).toBeDefined();
        expect(
            screen.getByText(
                'meal_planner_course_details.final_test_description'
            )
        ).toBeDefined();
        expect(screen.queryByTestId('mock-course-completed')).toBeNull();
    });

    it('renders CourseCompleted component when test is passed', () => {
        const onPassMock = vi.fn();
        render(
            <MealPlannerTestStep
                isTestPassed={true}
                currentUser={{ name: 'Chef Gordon' } as any}
                onPass={onPassMock}
            />
        );

        expect(screen.queryByTestId('mock-course-test')).toBeNull();
        expect(screen.getByTestId('mock-course-completed')).toBeDefined();
        expect(
            screen.getByText(
                'Completed: Meal Planner Certificate - Chef Gordon'
            )
        ).toBeDefined();
    });
});
