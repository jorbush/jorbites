import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CommunityEventsClient from '@/app/courses/community-events/CommunityEventsClient';
import React from 'react';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'contest_manager_course_details.next_step')
                return 'Next Step';
            if (key === 'contest_manager_course_details.mark_completed')
                return 'Mark Completed';
            return key;
        },
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Mock CertificateGenerator
vi.mock('@/app/components/courses/CertificateGenerator', () => ({
    default: () => (
        <div data-testid="certificate-generator">Certificate Generator</div>
    ),
}));

describe('CommunityEventsClient', () => {
    it('renders the overview checklist screen first', () => {
        render(<CommunityEventsClient currentUser={null} />);

        expect(
            screen.getByText('community_events_course_details.overview_title')
        ).toBeDefined();
        expect(
            screen.getByText('community_events_course_details.action_required')
        ).toBeDefined();
    });

    it('next step button is disabled initially until checklist is verified', () => {
        render(<CommunityEventsClient currentUser={null} />);

        const nextBtn = screen.getByText('Next Step');
        expect(nextBtn).toBeDefined();
        expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('enables the next step button when all checklist items are ticked', () => {
        render(<CommunityEventsClient currentUser={null} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBe(4);

        checkboxes.forEach((cb) => {
            fireEvent.click(cb);
        });

        const nextBtn = screen.getByText('Next Step');
        expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

        // Click next step to navigate to challenges page
        fireEvent.click(nextBtn);

        // Should now show the Challenges header details
        expect(
            screen.getByText('community_events_course_details.challenges_title')
        ).toBeDefined();
    });
});
