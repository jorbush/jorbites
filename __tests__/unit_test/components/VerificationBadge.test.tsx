import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import VerificationBadge from '@/app/components/VerificationBadge';

vi.mock('react-icons/md', () => ({
    MdVerified: () => <span data-testid="md-verified-icon" />,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) =>
            key === 'verification_tooltip' ? 'This is a nice Jorbiter' : key,
    }),
}));

vi.mock('@/app/components/utils/Tooltip', () => ({
    default: ({
        children,
        text,
        position = 'top',
    }: {
        children: React.ReactNode;
        text: string;
        position?: string;
    }) => (
        <div
            data-testid="tooltip-wrapper"
            data-text={text}
            data-position={position}
        >
            {children}
        </div>
    ),
}));

describe('VerificationBadge', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the verification icon', () => {
        render(<VerificationBadge />);
        expect(screen.getByTestId('md-verified-icon')).toBeDefined();
    });

    it('passes the correct tooltip text', () => {
        render(<VerificationBadge />);
        const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
        expect(tooltipWrapper).toHaveProperty(
            'dataset.text',
            'This is a nice Jorbiter'
        );
    });

    it('applies custom class to the verification icon', () => {
        render(<VerificationBadge className="custom-class" />);
        const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
        expect(tooltipWrapper).toBeDefined();
    });

    it('uses the specified tooltip position', () => {
        render(<VerificationBadge tooltipPosition="bottom" />);
        const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
        expect(tooltipWrapper).toHaveProperty('dataset.position', 'bottom');
    });

    it('uses default tooltip position when not specified', () => {
        render(<VerificationBadge />);
        const tooltipWrapper = screen.getByTestId('tooltip-wrapper');
        expect(tooltipWrapper).toHaveProperty('dataset.position', 'top');
    });

    it('passes size prop to icon when specified', () => {
        render(<VerificationBadge size={24} />);
        expect(screen.getByTestId('md-verified-icon')).toBeDefined();
    });

    it('adds data-testid to the verification icon', () => {
        render(<VerificationBadge />);
        expect(screen.getByTestId('md-verified-icon')).toBeDefined();
    });
});
