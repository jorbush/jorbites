import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateGenerator from '@/app/components/courses/certificate/CertificateGenerator';
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

// Mock next/dynamic to render synchronously during test execution
vi.mock('next/dynamic', () => ({
    default: () => {
        return function MockedDynamicComponent(props: any) {
            return (
                <div data-testid="mock-download-section">
                    MockedDownloadSection: {props.name} | {props.courseTitle}
                </div>
            );
        };
    },
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('<CertificateGenerator />', () => {
    const defaultProps = {
        courseTitle: 'Jorbites Basics',
        currentUserNames: null,
        badgePath: '/badges/basics_badge.webp',
    };

    it('renders name entry form initially if currentUserNames is not provided', () => {
        render(<CertificateGenerator {...defaultProps} />);

        expect(
            screen.getByText(
                'contest_manager_course_details.download_your_certificate'
            )
        ).toBeDefined();
        expect(
            screen.getByText(
                'contest_manager_course_details.enter_certificate_name_desc'
            )
        ).toBeDefined();
        expect(
            screen.getByLabelText(
                'contest_manager_course_details.your_full_name'
            )
        ).toBeDefined();
        expect(
            screen.getByRole('button', {
                name: 'contest_manager_course_details.confirm',
            })
        ).toBeDefined();
    });

    it('enables confirm button when name is typed, and submits form to show Download Section', async () => {
        render(<CertificateGenerator {...defaultProps} />);

        const input = screen.getByLabelText(
            'contest_manager_course_details.your_full_name'
        );
        const confirmButton = screen.getByRole('button', {
            name: 'contest_manager_course_details.confirm',
        });

        // Initially disabled since name is empty
        expect(confirmButton.hasAttribute('disabled')).toBe(true);

        // Type a name
        fireEvent.change(input, { target: { value: 'Jordi Bonet' } });

        // Now button should be enabled
        expect(confirmButton.hasAttribute('disabled')).toBe(false);

        // Submit form
        fireEvent.click(confirmButton);

        // Name confirmed block should be rendered
        expect(
            await screen.findByText(
                'contest_manager_course_details.name_confirmed: Jordi Bonet'
            )
        ).toBeDefined();
        expect(
            screen.getByText('contest_manager_course_details.change_name')
        ).toBeDefined();

        // Download Section should render with the confirmed name
        expect(screen.getByTestId('mock-download-section')).toBeDefined();
        expect(
            screen.getByText(
                'MockedDownloadSection: Jordi Bonet | Jorbites Basics'
            )
        ).toBeDefined();
    });

    it('renders Download Section immediately if currentUserNames is provided', () => {
        render(
            <CertificateGenerator
                {...defaultProps}
                currentUserNames="Jordi Bonet"
            />
        );

        // Name confirmed block should render immediately
        expect(
            screen.getByText(
                'contest_manager_course_details.name_confirmed: Jordi Bonet'
            )
        ).toBeDefined();
        expect(screen.getByTestId('mock-download-section')).toBeDefined();
    });

    it('allows changing name from the confirmed state', async () => {
        render(
            <CertificateGenerator
                {...defaultProps}
                currentUserNames="Jordi Bonet"
            />
        );

        // Click change name button
        const changeNameButton = screen.getByText(
            'contest_manager_course_details.change_name'
        );
        fireEvent.click(changeNameButton);

        // Should return to the form with name input prefilled
        const input = screen.getByLabelText(
            'contest_manager_course_details.your_full_name'
        );
        expect((input as HTMLInputElement).value).toBe('Jordi Bonet');
        expect(screen.queryByTestId('mock-download-section')).toBeNull();
    });
});
