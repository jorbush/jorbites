import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseCompleted from '@/app/components/courses/CourseCompleted';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock CertificateGenerator
vi.mock('@/app/components/courses/CertificateGenerator', () => ({
    default: (props: any) => (
        <div data-testid="mock-cert-generator">
            MockedCert: {props.courseTitle} | {props.currentUserNames} |{' '}
            {props.badgePath}
        </div>
    ),
}));

afterEach(() => {
    cleanup();
});

describe('CourseCompleted', () => {
    it('renders pass message and mocked certificate generator correctly', () => {
        render(
            <CourseCompleted
                courseTitle="Advanced Baking Course"
                currentUserNames="Jordi Jorbites"
                badgePath="/badges/baking_badge.jpg"
            />
        );

        // Success alert title
        expect(screen.getByText('pass_message')).toBeDefined();

        // Check if certificate details are successfully passed to CertificateGenerator
        const generator = screen.getByTestId('mock-cert-generator');
        expect(generator).toBeDefined();
        expect(generator.textContent).toContain(
            'MockedCert: Advanced Baking Course | Jordi Jorbites | /badges/baking_badge.jpg'
        );
    });
});
