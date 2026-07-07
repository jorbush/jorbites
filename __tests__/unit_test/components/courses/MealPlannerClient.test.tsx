import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MealPlannerClient from '@/app/courses/meal-planner/MealPlannerClient';
import React from 'react';

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

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('MealPlannerClient', () => {
    afterEach(() => {
        cleanup();
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
});
