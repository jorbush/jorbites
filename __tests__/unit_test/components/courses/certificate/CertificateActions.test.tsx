import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateActions, {
    getActionLabel,
} from '@/app/components/courses/certificate/CertificateActions';
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

describe('getActionLabel', () => {
    const mockT = (key: string) => `translated_${key}`;

    it('returns coming_soon when comingSoon is true', () => {
        expect(getActionLabel(mockT, true, false, false)).toBe(
            'translated_coming_soon'
        );
        expect(getActionLabel(mockT, true, true, false)).toBe(
            'translated_coming_soon'
        );
    });

    it('returns course_completed when completed', () => {
        expect(getActionLabel(mockT, false, true, false)).toBe(
            'translated_course_completed'
        );
    });

    it('returns continue_course when started', () => {
        expect(getActionLabel(mockT, false, false, true)).toBe(
            'translated_continue_course'
        );
    });

    it('returns start_course by default', () => {
        expect(getActionLabel(mockT, false, false, false)).toBe(
            'translated_start_course'
        );
    });
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
});
