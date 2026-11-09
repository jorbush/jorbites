import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
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

// Mock CertificateGenerator
vi.mock('@/app/components/courses/certificate/CertificateGenerator', () => ({
    default: (props: any) => (
        <div data-testid="mock-cert-generator">
            MockedCertGenerator: {props.courseTitle} - {props.currentUserNames}
        </div>
    ),
}));

describe('WorkshopsClient', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
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

    it('progresses to workflow step when requirements are checked and next is clicked', async () => {
        render(<WorkshopsClient currentUser={null} />);

        // Check the 4 requirements
        const checkCapacity = screen.getByLabelText(
            'workshops_course_details.checklist_capacity'
        );
        const checkPrivacy = screen.getByLabelText(
            'workshops_course_details.checklist_privacy'
        );
        const checkWhitelist = screen.getByLabelText(
            'workshops_course_details.checklist_whitelist'
        );
        const checkPrereqs = screen.getByLabelText(
            'workshops_course_details.checklist_prereqs'
        );

        fireEvent.click(checkCapacity);
        fireEvent.click(checkPrivacy);
        fireEvent.click(checkWhitelist);
        fireEvent.click(checkPrereqs);

        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        });
        fireEvent.click(nextBtn);

        expect(
            await screen.findByText('workshops_course_details.workflow_title')
        ).toBeDefined();
    });

    it('renders certificate when the test module is completed', () => {
        localStorage.setItem(
            'jorbites_course_workshops_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                whitelist: true,
                approvals: true,
                test: true,
            })
        );

        render(<WorkshopsClient currentUser={{ name: 'Chef Elena' } as any} />);

        const testNavBtn = screen.getAllByText('final_test')[0];
        fireEvent.click(testNavBtn);

        expect(
            screen.getByText(
                'MockedCertGenerator: Workshops & Classes Certificate - Chef Elena'
            )
        ).toBeDefined();
    });
});
