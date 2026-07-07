import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import React from 'react';
import { FiBookOpen, FiCheck } from 'react-icons/fi';

afterEach(() => {
    cleanup();
});

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

describe('CourseLayout', () => {
    const steps = [
        { id: 'overview', title: 'Overview', icon: FiCheck, isCompleted: true },
        {
            id: 'test',
            title: 'Final Test',
            icon: FiBookOpen,
            isCompleted: false,
        },
    ];

    it('renders header sections and back button correctly', () => {
        render(
            <CourseLayout
                courseTitle="My Test Course"
                courseDescription="A course to verify layout rendering"
                headerIcon={FiBookOpen}
                steps={steps}
                activeStep="overview"
                onSelectStep={() => {}}
            >
                <div data-testid="course-children">Inside Content Panel</div>
            </CourseLayout>
        );

        // Check header title & description
        expect(screen.getByText('My Test Course')).toBeDefined();
        expect(
            screen.getByText('A course to verify layout rendering')
        ).toBeDefined();

        // Check children content
        expect(screen.getByTestId('course-children')).toBeDefined();

        // Check back button exists
        const backBtn = screen.getByRole('button', { name: /back/i });
        expect(backBtn).toBeDefined();

        // Fire click on back button
        fireEvent.click(backBtn);
        expect(mockPush).toHaveBeenCalledWith('/courses');
    });

    it('renders stepper list correctly', () => {
        const onSelectStepMock = vi.fn();

        render(
            <CourseLayout
                courseTitle="My Test Course"
                courseDescription="A course to verify layout rendering"
                headerIcon={FiBookOpen}
                steps={steps}
                activeStep="overview"
                onSelectStep={onSelectStepMock}
            >
                <div>Content</div>
            </CourseLayout>
        );

        // Stepper contains step items (e.g. Overview & Final Test buttons)
        const overviewBtn = screen.getAllByRole('button', {
            name: /overview/i,
        })[0];
        const testBtn = screen.getAllByRole('button', {
            name: /final test/i,
        })[0];

        expect(overviewBtn).toBeDefined();
        expect(testBtn).toBeDefined();

        // Clicking step buttons calls selection handler
        fireEvent.click(testBtn);
        expect(onSelectStepMock).toHaveBeenCalledWith('test');
    });
});
