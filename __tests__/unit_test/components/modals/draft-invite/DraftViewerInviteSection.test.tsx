import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DraftViewerInviteSection from '@/app/components/modals/draft-invite/DraftViewerInviteSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftViewerInviteSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('renders invite link and copy button when inviteUrl exists', async () => {
        const inviteUrl =
            'http://localhost:3000/recipes/new?draft=123&token=abc';
        render(<DraftViewerInviteSection inviteUrl={inviteUrl} />);

        const input = screen.getByTestId('invite-link-input');
        expect(input).toHaveValue(inviteUrl);
        expect(input).toHaveAttribute('readonly');

        const copyBtn = screen.getByTestId('copy-invite-link-btn');
        fireEvent.click(copyBtn);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                inviteUrl
            );
        });
    });

    it('renders informational message when inviteUrl is empty', () => {
        render(<DraftViewerInviteSection inviteUrl="" />);

        expect(
            screen.getByText('Only the draft owner can generate invite links.')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('invite-link-input')
        ).not.toBeInTheDocument();
    });
});
