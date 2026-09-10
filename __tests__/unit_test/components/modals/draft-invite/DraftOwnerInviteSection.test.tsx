import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DraftOwnerInviteSection from '@/app/components/modals/draft-invite/DraftOwnerInviteSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftOwnerInviteSection', () => {
    const defaultProps = {
        inviteUrl: 'http://localhost:3000/recipes/new?draft=123&token=abc',
        isRegenerating: false,
        onRegenerate: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('renders invite link input and copy button for owner', async () => {
        render(<DraftOwnerInviteSection {...defaultProps} />);

        const input = screen.getByTestId('invite-link-input');
        expect(input).toHaveValue(defaultProps.inviteUrl);
        expect(input).toHaveAttribute('readonly');

        const copyBtn = screen.getByTestId('copy-invite-link-btn');
        expect(copyBtn).toBeInTheDocument();
        fireEvent.click(copyBtn);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                defaultProps.inviteUrl
            );
        });
    });

    it('handles regenerate link confirmation flow', async () => {
        render(<DraftOwnerInviteSection {...defaultProps} />);

        const regenBtn = screen.getByTestId('regenerate-invite-link-btn');
        fireEvent.click(regenBtn);

        expect(
            screen.getByTestId('regenerate-confirm-box')
        ).toBeInTheDocument();

        // Cancel
        const cancelBtn = screen.getByTestId('regenerate-cancel-btn');
        fireEvent.click(cancelBtn);
        expect(
            screen.queryByTestId('regenerate-confirm-box')
        ).not.toBeInTheDocument();

        // Re-open and confirm
        fireEvent.click(screen.getByTestId('regenerate-invite-link-btn'));
        const confirmBtn = screen.getByTestId('regenerate-confirm-btn');
        fireEvent.click(confirmBtn);

        expect(defaultProps.onRegenerate).toHaveBeenCalled();
    });

    it('displays regenerating state when isRegenerating is true', () => {
        render(
            <DraftOwnerInviteSection
                {...defaultProps}
                inviteUrl=""
                isRegenerating={true}
            />
        );

        const input = screen.getByTestId('invite-link-input');
        expect(input).toHaveAttribute(
            'placeholder',
            'Generating invite link...'
        );
    });
});
