import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateActions from '@/app/components/courses/certificate/CertificateActions';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('<CertificateActions />', () => {
    it('renders start course action by default', () => {
        const handleNavigate = vi.fn();

        render(
            <CertificateActions
                slug="jorbites-basics"
                isCompleted={false}
                hasStarted={false}
                onNavigateCourse={handleNavigate}
            />
        );

        const button = screen.getByText('start_course');
        expect(button).toBeDefined();

        fireEvent.click(button);
        expect(handleNavigate).toHaveBeenCalledTimes(1);
    });

    it('renders continue course action when course has started', () => {
        render(
            <CertificateActions
                slug="jorbites-basics"
                isCompleted={false}
                hasStarted={true}
            />
        );

        expect(screen.getByText('continue_course')).toBeDefined();
    });

    it('renders completed state when course is completed without certificateId', () => {
        render(
            <CertificateActions
                slug="jorbites-basics"
                isCompleted={true}
                hasStarted={false}
            />
        );

        expect(screen.getByText('course_completed')).toBeDefined();
        expect(screen.queryByText('view_certificate')).toBeNull();
    });

    it('renders view certificate button when completed and certificateId provided', () => {
        const handleViewCert = vi.fn();

        render(
            <CertificateActions
                slug="jorbites-basics"
                certificateId="CERT-123"
                isCompleted={true}
                hasStarted={false}
                onViewCertificate={handleViewCert}
            />
        );

        const viewCertBtn = screen.getByText('view_certificate');
        expect(viewCertBtn).toBeDefined();

        fireEvent.click(viewCertBtn);
        expect(handleViewCert).toHaveBeenCalledTimes(1);
    });

    it('handles coming soon state and disables the button', () => {
        const handleNavigate = vi.fn();

        render(
            <CertificateActions
                slug="jorbites-basics"
                isCompleted={false}
                hasStarted={false}
                comingSoon={true}
                onNavigateCourse={handleNavigate}
            />
        );

        const comingSoonBtn = screen.getByRole('button', {
            name: 'coming_soon',
        });
        expect(comingSoonBtn).toBeDefined();
        expect((comingSoonBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('prioritizes coming soon over completed state', () => {
        render(
            <CertificateActions
                slug="jorbites-basics"
                isCompleted={true}
                hasStarted={false}
                comingSoon={true}
            />
        );

        const comingSoonBtn = screen.getByRole('button', {
            name: 'coming_soon',
        });
        expect(comingSoonBtn).toBeDefined();
        expect((comingSoonBtn as HTMLButtonElement).disabled).toBe(true);
    });
});
