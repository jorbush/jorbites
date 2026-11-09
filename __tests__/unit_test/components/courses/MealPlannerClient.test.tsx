import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import MealPlannerClient from '@/app/courses/meal-planner/MealPlannerClient';
import React from 'react';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: vi.fn(),
    }),
}));

// Mock CertificateGenerator
vi.mock('@/app/components/courses/certificate/CertificateGenerator', () => ({
    default: (props: any) => (
        <div data-testid="mock-cert-generator">
            MockedCertGenerator: {props.courseTitle}
        </div>
    ),
}));

describe('MealPlannerClient', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it('renders the course layout and initial overview step', () => {
        render(<MealPlannerClient currentUser={null} />);

        // Layout elements
        expect(screen.getByText('course_meal_planner')).toBeDefined();
        expect(
            screen.getByText('meal_planner_course_details.course_description')
        ).toBeDefined();

        // Renders sidebar steps
        expect(screen.getAllByText('requirements').length).toBeGreaterThan(0);
        expect(screen.getAllByText('workflow').length).toBeGreaterThan(0);
        expect(screen.getAllByText('meals').length).toBeGreaterThan(0);
        expect(screen.getAllByText('calendar_alerts').length).toBeGreaterThan(
            0
        );
        expect(screen.getAllByText('final_test').length).toBeGreaterThan(0);

        // Renders requirements checklist content
        expect(
            screen.getByText('meal_planner_course_details.requirements_title')
        ).toBeDefined();
    });

    it('progresses sequentially through all modules to the final test', async () => {
        render(<MealPlannerClient currentUser={null} />);

        // 1. Requirements Module -> Check all 4 boxes
        const checkPrivacy = screen.getByLabelText(
            'meal_planner_course_details.checklist_privacy'
        );
        const checkSlots = screen.getByLabelText(
            'meal_planner_course_details.checklist_slots'
        );
        const checkShopping = screen.getByLabelText(
            'meal_planner_course_details.checklist_shopping'
        );
        const checkCalendar = screen.getByLabelText(
            'meal_planner_course_details.checklist_calendar'
        );

        fireEvent.click(checkPrivacy);
        fireEvent.click(checkSlots);
        fireEvent.click(checkShopping);
        fireEvent.click(checkCalendar);

        // Next button is now enabled
        const nextBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.next_step/i,
        });
        fireEvent.click(nextBtn);

        // 2. Workflow Timeline Step
        expect(
            await screen.findByText(
                'meal_planner_course_details.workflow_title'
            )
        ).toBeDefined();

        // Advance through 5 steps of the timeline
        for (let i = 1; i <= 4; i++) {
            const workflowNextBtn = screen.getByRole('button', {
                name: /contest_manager_course_details.next_step/i,
            });
            fireEvent.click(workflowNextBtn);
            expect(
                await screen.findByText(new RegExp(`\\(${i + 1}/5\\)`))
            ).toBeDefined();
        }

        // Complete workflow step
        const workflowCompleteBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(workflowCompleteBtn);

        // 3. Scheduling & Diet Slots step
        expect(
            await screen.findByText(
                'meal_planner_course_details.slots_info_title'
            )
        ).toBeDefined();
        const completeSlotsBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeSlotsBtn);

        // 4. Shopping Lists & Calendar Syncing step
        expect(
            await screen.findByText(
                'meal_planner_course_details.exports_info_title'
            )
        ).toBeDefined();
        const completeExportsBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeExportsBtn);

        // 5. Final Test
        expect(
            await screen.findByText(
                'meal_planner_course_details.final_test_description'
            )
        ).toBeDefined();
    });

    it('renders certificate when the test module is completed', () => {
        localStorage.setItem(
            'jorbites_course_meal_planner_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                slots: true,
                exports: true,
                test: true,
            })
        );

        render(
            <MealPlannerClient currentUser={{ name: 'Chef Marie' } as any} />
        );

        // Click final test step in navigation
        const testNavBtn = screen.getAllByText('final_test')[0];
        fireEvent.click(testNavBtn);

        expect(
            screen.getByText(/MockedCertGenerator: Meal Planner Certificate/)
        ).toBeDefined();
    });

    it('navigates directly to slots step when prior modules are completed', async () => {
        localStorage.setItem(
            'jorbites_course_meal_planner_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
            })
        );

        render(<MealPlannerClient currentUser={null} />);

        const slotsNavBtn = screen.getAllByText('meals')[0];
        fireEvent.click(slotsNavBtn);

        expect(
            await screen.findByText(
                'meal_planner_course_details.slots_info_title'
            )
        ).toBeDefined();
    });

    it('navigates directly to exports step when prior modules are completed', async () => {
        localStorage.setItem(
            'jorbites_course_meal_planner_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                slots: true,
            })
        );

        render(<MealPlannerClient currentUser={null} />);

        const exportsNavBtn = screen.getAllByText('calendar_alerts')[0];
        fireEvent.click(exportsNavBtn);

        expect(
            await screen.findByText(
                'meal_planner_course_details.exports_info_title'
            )
        ).toBeDefined();
    });
});
