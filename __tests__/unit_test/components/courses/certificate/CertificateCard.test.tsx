import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateCard from '@/app/components/courses/certificate/CertificateCard';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock next/navigation useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('<CertificateCard />', () => {
    const defaultProps = {
        id: 'basics',
        title: 'Jorbites Basics',
        description: 'Learn the essentials of Jorbites',
        duration: '1 hour',
        progress: 0,
        slug: 'jorbites-basics',
        badgeSrc: '/badges/basics_badge.webp',
    };

    it('renders the course details correctly', () => {
        render(<CertificateCard {...defaultProps} />);

        expect(screen.getByText('Jorbites Basics')).toBeDefined();
        expect(
            screen.getByText('Learn the essentials of Jorbites')
        ).toBeDefined();
        expect(screen.getByText('1 hour')).toBeDefined();
        // Since progress is 0, start_course should render
        expect(screen.getByText('start_course')).toBeDefined();
    });

    it('displays progress bar when course has started but not completed', () => {
        render(
            <CertificateCard
                {...defaultProps}
                progress={50}
            />
        );

        expect(screen.getByText('Progress')).toBeDefined();
        expect(screen.getByText('50%')).toBeDefined();
        expect(screen.getByText('continue_course')).toBeDefined();
    });

    it('shows completed state when progress is 100%', () => {
        render(
            <CertificateCard
                {...defaultProps}
                progress={100}
            />
        );

        expect(screen.getByText('Completed')).toBeDefined();
        expect(screen.getByText('course_completed')).toBeDefined();
    });

    it('handles coming soon state correctly', () => {
        render(
            <CertificateCard
                {...defaultProps}
                comingSoon={true}
            />
        );

        // Should render coming_soon label on the card
        const comingSoonBadges = screen.getAllByText('coming_soon');
        expect(comingSoonBadges.length).toBeGreaterThan(0);
    });

    it('navigates to course page when clicked', () => {
        render(<CertificateCard {...defaultProps} />);

        const button = screen.getByText('start_course');
        fireEvent.click(button);

        expect(mockPush).toHaveBeenCalledWith('/courses/jorbites-basics');
    });
});
