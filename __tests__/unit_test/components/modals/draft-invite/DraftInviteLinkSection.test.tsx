import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DraftInviteLinkSection from '@/app/components/modals/draft-invite/DraftInviteLinkSection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftInviteLinkSection', () => {
    const defaultProps = {
        isOwner: true,
        inviteUrl: 'http://localhost:3000/recipes/new?draft=123&token=abc',
        hasInviteToken: true,
        isRegenerating: false,
        copied: false,
        showRegenerateConfirm: false,
        onCopy: vi.fn(),
        onRequestRegenerate: vi.fn(),
        onCancelRegenerate: vi.fn(),
        onConfirmRegenerate: vi.fn(),
    };

    it('renders invite link input and copy button for owner', () => {
        render(<DraftInviteLinkSection {...defaultProps} />);

        const input = screen.getByTestId('invite-link-input');
        expect(input).toHaveValue(defaultProps.inviteUrl);
        expect(input).toHaveAttribute('readonly');

        const copyBtn = screen.getByTestId('copy-invite-link-btn');
        expect(copyBtn).toBeInTheDocument();
        fireEvent.click(copyBtn);
        expect(defaultProps.onCopy).toHaveBeenCalled();
    });

    it('displays copied state when copied is true', () => {
        render(
            <DraftInviteLinkSection
                {...defaultProps}
                copied={true}
            />
        );
        expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('triggers regenerate confirmation workflow', () => {
        const { rerender } = render(
            <DraftInviteLinkSection {...defaultProps} />
        );

        const regenBtn = screen.getByTestId('regenerate-invite-link-btn');
        fireEvent.click(regenBtn);
        expect(defaultProps.onRequestRegenerate).toHaveBeenCalled();

        // Rerender with confirm box open
        rerender(
            <DraftInviteLinkSection
                {...defaultProps}
                showRegenerateConfirm={true}
            />
        );

        expect(
            screen.getByTestId('regenerate-confirm-box')
        ).toBeInTheDocument();

        const cancelBtn = screen.getByTestId('regenerate-cancel-btn');
        fireEvent.click(cancelBtn);
        expect(defaultProps.onCancelRegenerate).toHaveBeenCalled();

        const confirmBtn = screen.getByTestId('regenerate-confirm-btn');
        fireEvent.click(confirmBtn);
        expect(defaultProps.onConfirmRegenerate).toHaveBeenCalled();
    });

    it('renders correctly for non-owner with invite link', () => {
        render(
            <DraftInviteLinkSection
                {...defaultProps}
                isOwner={false}
            />
        );

        expect(screen.getByTestId('invite-link-input')).toBeInTheDocument();
        expect(
            screen.queryByTestId('regenerate-invite-link-btn')
        ).not.toBeInTheDocument();
    });

    it('renders message for non-owner when no invite link exists', () => {
        render(
            <DraftInviteLinkSection
                {...defaultProps}
                isOwner={false}
                inviteUrl=""
                hasInviteToken={false}
            />
        );

        expect(
            screen.getByText('Only the draft owner can generate invite links.')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('invite-link-input')
        ).not.toBeInTheDocument();
    });
});
