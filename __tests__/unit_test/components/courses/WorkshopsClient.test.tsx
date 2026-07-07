import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopsClient from '@/app/courses/workshops/WorkshopsClient';
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

describe('WorkshopsClient', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the course layout and initial overview step', () => {
        render(<WorkshopsClient currentUser={null} />);

        // Layout elements
        expect(screen.getByText('course_workshops')).toBeDefined();
        expect(
            screen.getByText('workshops_course_details.course_description')
        ).toBeDefined();

        // Renders sidebar steps
        expect(screen.getAllByText('requirements').length).toBeGreaterThan(0);
        expect(screen.getAllByText('workflow').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText('workshop_whitelist').length
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('workshop_details').length).toBeGreaterThan(
            0
        );
        expect(screen.getAllByText('final_test').length).toBeGreaterThan(0);

        // Renders requirements checklist content
        expect(
            screen.getByText('workshops_course_details.requirements_title')
        ).toBeDefined();
    });
});
