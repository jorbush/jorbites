import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';
import React from 'react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const MOCK_ITEMS: CourseOverviewItem[] = [
    {
        key: 'first',
        labelKey: 'course.first_label',
        descKey: 'course.first_desc',
        checklistKey: 'course.first_checklist',
        checkboxId: 'first-checkbox',
    },
    {
        key: 'second',
        labelKey: 'course.second_label',
        descKey: 'course.second_desc',
        checklistKey: 'course.second_checklist',
    },
];

describe('CourseOverviewStep', () => {
    let markModuleCompletedMock: ReturnType<typeof vi.fn>;
    let onNextMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        markModuleCompletedMock = vi.fn();
        onNextMock = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders title, optional intro, cards, and checklist items', () => {
        render(
            <CourseOverviewStep
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
                moduleId="overview"
                titleKey="course.title"
                introKey="course.intro"
                actionRequiredKey="course.action_required"
                items={MOCK_ITEMS}
            />
        );

        expect(screen.getByText('course.title')).toBeDefined();
        expect(screen.getByText('course.intro')).toBeDefined();
        expect(screen.getByText('course.first_label')).toBeDefined();
        expect(screen.getByText('course.first_desc')).toBeDefined();
        expect(screen.getByText('course.second_label')).toBeDefined();
        expect(screen.getByText('course.action_required')).toBeDefined();

        const firstCheckbox = screen.getByLabelText('course.first_checklist');
        expect(firstCheckbox.getAttribute('id')).toBe('first-checkbox');

        const secondCheckbox = screen.getByLabelText('course.second_checklist');
        expect(secondCheckbox.getAttribute('id')).toBeNull();
    });

    it('omits intro paragraph when introKey is not provided', () => {
        render(
            <CourseOverviewStep
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
                moduleId="overview"
                titleKey="course.title"
                actionRequiredKey="course.action_required"
                items={MOCK_ITEMS}
            />
        );

        expect(screen.queryByText('course.intro')).toBeNull();
    });

    it('marks module completed when all checkboxes are checked and enables next button when completed', () => {
        const { rerender } = render(
            <CourseOverviewStep
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
                moduleId="overview"
                titleKey="course.title"
                actionRequiredKey="course.action_required"
                items={MOCK_ITEMS}
            />
        );

        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        }) as HTMLButtonElement;
        expect(nextBtn.disabled).toBe(true);

        fireEvent.click(screen.getByLabelText('course.first_checklist'));
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        fireEvent.click(screen.getByLabelText('course.second_checklist'));
        expect(markModuleCompletedMock).toHaveBeenCalledWith('overview');

        rerender(
            <CourseOverviewStep
                completedModules={{ overview: true }}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
                moduleId="overview"
                titleKey="course.title"
                actionRequiredKey="course.action_required"
                items={MOCK_ITEMS}
            />
        );

        expect(nextBtn.disabled).toBe(false);
        fireEvent.click(nextBtn);
        expect(onNextMock).toHaveBeenCalled();
    });
});
