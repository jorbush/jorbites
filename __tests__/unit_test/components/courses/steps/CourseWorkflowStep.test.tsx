import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import React from 'react';
import { FiCheck } from 'react-icons/fi';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

afterEach(() => {
    cleanup();
});

describe('CourseWorkflowStep', () => {
    it('renders with custom step prefix and step count correctly', () => {
        render(
            <CourseWorkflowStep
                title="My Interactive Workflow"
                icon={FiCheck}
                stepPrefix="my_course.step"
                totalSteps={3}
                onComplete={() => {}}
            />
        );

        expect(screen.getByText('My Interactive Workflow')).toBeDefined();

        // Check if localized step title keys are generated and displayed
        expect(screen.getByText('my_course.step1_title')).toBeDefined();
        expect(screen.getByText('my_course.step2_title')).toBeDefined();
        expect(screen.getByText('my_course.step3_title')).toBeDefined();
    });

    it('navigates through steps and fires onComplete callback at final step', () => {
        const onCompleteMock = vi.fn();
        render(
            <CourseWorkflowStep
                title="My Interactive Workflow"
                icon={FiCheck}
                stepPrefix="my_course.step"
                totalSteps={3}
                onComplete={onCompleteMock}
            />
        );

        // Starts at step 1
        expect(screen.getByText(/1\/3/)).toBeDefined();

        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        });
        expect(nextBtn).toBeDefined();

        // Click to step 2
        fireEvent.click(nextBtn);
        expect(screen.getByText(/2\/3/)).toBeDefined();

        // Click to step 3
        fireEvent.click(nextBtn);
        expect(screen.getByText(/3\/3/)).toBeDefined();

        // Button changes to complete button
        const completeBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        expect(completeBtn).toBeDefined();

        // Click complete triggers callback
        fireEvent.click(completeBtn);
        expect(onCompleteMock).toHaveBeenCalled();
    });
});
