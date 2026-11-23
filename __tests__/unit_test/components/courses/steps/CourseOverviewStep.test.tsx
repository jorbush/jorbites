import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CourseOverviewStep, {
    OverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';
import React from 'react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const MOCK_ITEMS: OverviewItem[] = [
    {
        key: 'first',
        labelKey: 'test.first_label',
        descKey: 'test.first_desc',
        checklistKey: 'test.first_check',
    },
    {
        key: 'second',
        labelKey: 'test.second_label',
        descKey: 'test.second_desc',
        checklistKey: 'test.second_check',
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
                moduleId="requirements"
                titleKey="test.title"
                introKey="test.intro"
                actionRequiredKey="test.action_required"
                items={MOCK_ITEMS}
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(screen.getByText('test.title')).toBeDefined();
        expect(screen.getByText('test.intro')).toBeDefined();
        expect(screen.getByText('test.first_label')).toBeDefined();
        expect(screen.getByText('test.first_desc')).toBeDefined();
        expect(screen.getByText('test.second_label')).toBeDefined();
        expect(screen.getByText('test.second_desc')).toBeDefined();
        expect(screen.getByText('test.action_required')).toBeDefined();
    });

    it('omits intro paragraph when introKey is not provided', () => {
        render(
            <CourseOverviewStep
                moduleId="overview"
                titleKey="test.title"
                actionRequiredKey="test.action_required"
                items={MOCK_ITEMS}
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(screen.queryByText('test.intro')).toBeNull();
    });

    it('marks the module completed when all checkboxes are checked and enables next step when completed', () => {
        const { rerender } = render(
            <CourseOverviewStep
                moduleId="requirements"
                titleKey="test.title"
                actionRequiredKey="test.action_required"
                items={MOCK_ITEMS}
                completedModules={{}}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        }) as HTMLButtonElement;
        expect(nextBtn.disabled).toBe(true);

        fireEvent.click(screen.getByLabelText('test.first_check'));
        expect(markModuleCompletedMock).not.toHaveBeenCalled();

        fireEvent.click(screen.getByLabelText('test.second_check'));
        expect(markModuleCompletedMock).toHaveBeenCalledWith('requirements');

        rerender(
            <CourseOverviewStep
                moduleId="requirements"
                titleKey="test.title"
                actionRequiredKey="test.action_required"
                items={MOCK_ITEMS}
                completedModules={{ requirements: true }}
                markModuleCompleted={markModuleCompletedMock}
                onNext={onNextMock}
            />
        );

        expect(nextBtn.disabled).toBe(false);
        fireEvent.click(nextBtn);
        expect(onNextMock).toHaveBeenCalled();
    });
});
