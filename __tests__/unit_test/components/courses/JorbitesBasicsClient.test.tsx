import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JorbitesBasicsClient from '@/app/courses/jorbites-basics/JorbitesBasicsClient';
import React from 'react';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock useCourseProgress
vi.mock('@/app/hooks/useCourseProgress', () => ({
    useCourseProgress: () => ({
        completedModules: { requirements: true },
        markModuleCompleted: vi.fn(),
        isTestPassed: false,
    }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe('JorbitesBasicsClient', () => {
    beforeEach(() => {
        // Set mock user profile to localStorage or setup environment
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the course layout and Jorbites Basics details correctly', () => {
        render(
            <JorbitesBasicsClient
                currentUser={
                    {
                        id: '1',
                        name: 'Jordi',
                        email: 'jordi@example.com',
                    } as any
                }
            />
        );

        // Checks course title and headers
        expect(screen.getByText('course_jorbites_basics')).toBeDefined();
        expect(
            screen.getByText(
                'jorbites_basics_course_details.course_description'
            )
        ).toBeDefined();

        // Checks requirements step sidebar item is active or rendered
        expect(screen.getAllByText('requirements').length).toBeGreaterThan(0);
        expect(screen.getAllByText('workflow').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText(
                'jorbites_basics_course_details.req_interactions_label'
            ).length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('jorbites_basics_course_details.pwa_info_title')
                .length
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('final_test').length).toBeGreaterThan(0);
    });
});
