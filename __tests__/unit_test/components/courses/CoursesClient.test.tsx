import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CoursesClient from '@/app/courses/CoursesClient';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (options && options.count !== undefined) {
                return `${key}_${options.count}`;
            }
            return key;
        },
    }),
}));

// Mock CertificateCard
vi.mock('@/app/components/courses/certificate/CertificateCard', () => ({
    default: ({ duration, title }: any) => (
        <div data-testid="certificate-card">
            <span data-testid="card-title">{title}</span>
            <span data-testid="card-duration">{duration}</span>
        </div>
    ),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

afterEach(() => {
    cleanup();
});

describe('<CoursesClient />', () => {
    it('renders all course cards with translated durations', () => {
        render(<CoursesClient currentUser={null} />);

        const durations = screen.getAllByTestId('card-duration');

        // Jorbites Basics (15 mins)
        expect(durations.some(d => d.textContent === 'duration_minutes_15')).toBe(true);

        // Recipe Creator (30 mins)
        expect(durations.some(d => d.textContent === 'duration_minutes_30')).toBe(true);

        // Workshops (1 hour)
        expect(durations.some(d => d.textContent === 'duration_hours_1')).toBe(true);

        // Contest Manager (2 hours)
        expect(durations.some(d => d.textContent === 'duration_hours_2')).toBe(true);
    });
});
