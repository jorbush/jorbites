import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseStepper from '@/app/components/courses/core/CourseStepper';
import React from 'react';
import { FiBookOpen } from 'react-icons/fi';

afterEach(() => {
    cleanup();
});

describe('<CourseStepper />', () => {
    const mockOnSelectModule = vi.fn();

    const mockModules = [
        {
            id: 'mod-1',
            title: 'Intro Module',
            isCompleted: true,
            icon: FiBookOpen,
        },
        {
            id: 'mod-2',
            title: 'Active Module',
            isCompleted: false,
            icon: FiBookOpen,
        },
        {
            id: 'mod-3',
            title: 'Future Module',
            isCompleted: false,
            icon: FiBookOpen,
        },
    ];

    it('renders all stepper modules with titles and indices', () => {
        render(
            <CourseStepper
                modules={mockModules}
                activeModuleId="mod-2"
                onSelectModule={mockOnSelectModule}
            />
        );

        // Verify titles are rendered (both mobile and desktop render them)
        const introTitles = screen.getAllByText('Intro Module');
        expect(introTitles.length).toBeGreaterThan(0);

        const activeTitles = screen.getAllByText('Active Module');
        expect(activeTitles.length).toBeGreaterThan(0);

        // For non-completed modules, the index number should be present
        const futureModuleIndex = screen.getAllByText('3');
        expect(futureModuleIndex.length).toBeGreaterThan(0);
    });

    it('calls onSelectModule with the correct ID when a step is clicked', () => {
        render(
            <CourseStepper
                modules={mockModules}
                activeModuleId="mod-2"
                onSelectModule={mockOnSelectModule}
            />
        );

        // Click the first module in desktop view
        const firstModuleButtons = screen.getAllByRole('button');
        // Click the desktop one (first one)
        fireEvent.click(firstModuleButtons[0]);

        expect(mockOnSelectModule).toHaveBeenCalledWith('mod-1');
    });
});
