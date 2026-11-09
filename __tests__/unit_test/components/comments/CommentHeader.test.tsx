import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentHeader from '@/app/components/comments/CommentHeader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/components/VerificationBadge', () => ({
    default: ({ className }: { className?: string }) => (
        <span
            data-testid="verification-badge"
            className={className}
        >
            Verified
        </span>
    ),
}));

vi.mock('@/app/components/comments/CookedBadge', () => ({
    default: () => <span data-testid="cooked-badge">Cooked</span>,
}));

describe('CommentHeader', () => {
    const mockNavigate = vi.fn();

    const defaultProps = {
        userName: 'Chef Gordon',
        verified: false,
        userLevel: 7,
        isCooked: false,
        onNavigateToProfile: mockNavigate,
    };

    it('renders author name and handles profile click', () => {
        render(<CommentHeader {...defaultProps} />);
        const nameButton = screen.getByRole('button', { name: 'Chef Gordon' });
        expect(nameButton).toBeDefined();

        fireEvent.click(nameButton);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('renders verification badge when verified is true', () => {
        render(
            <CommentHeader
                {...defaultProps}
                verified={true}
            />
        );
        expect(screen.getByTestId('verification-badge')).toBeDefined();
    });

    it('omits verification badge when verified is false', () => {
        render(<CommentHeader {...defaultProps} />);
        expect(screen.queryByTestId('verification-badge')).toBeNull();
    });

    it('renders level indicator text', () => {
        render(<CommentHeader {...defaultProps} />);
        expect(screen.getByText('level 7')).toBeDefined();
    });

    it('renders CookedBadge when isCooked is true', () => {
        render(
            <CommentHeader
                {...defaultProps}
                isCooked={true}
            />
        );
        expect(screen.getByTestId('cooked-badge')).toBeDefined();
    });

    it('omits CookedBadge when isCooked is false', () => {
        render(<CommentHeader {...defaultProps} />);
        expect(screen.queryByTestId('cooked-badge')).toBeNull();
    });
});
