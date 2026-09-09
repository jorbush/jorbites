import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import axios from 'axios';
import useSWR from 'swr';
import DraftInviteModal from '@/app/components/modals/DraftInviteModal';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';
import { SafeUser } from '@/app/types';
import { SharedDraft } from '@/app/types/draft';

vi.mock('@/app/hooks/useDraftInviteModal');
vi.mock('swr');
vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockOwner: SafeUser = {
    id: 'user-owner',
    name: 'Chef Owner',
    email: 'owner@example.com',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

const mockCoCook: SafeUser = {
    id: 'user-cocook',
    name: 'Alice CoCook',
    email: 'alice@example.com',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

const mockDraft: SharedDraft = {
    draftId: 'draft-abc-123',
    ownerId: 'user-owner',
    ownerName: 'Chef Owner',
    type: 'shared',
    inviteToken: 'secret-token-xyz',
    coCooksIds: ['user-cocook'],
    coCookRoles: {
        'user-cocook': 'editor',
    },
    title: 'Collaborative Pavlova',
    currentStep: 1,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

describe('DraftInviteModal component', () => {
    const mockOnClose = vi.fn();
    const mockMutateDraft = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useDraftInviteModal as any).mockReturnValue({
            isOpen: true,
            draftId: 'draft-abc-123',
            onClose: mockOnClose,
        });

        // Mock useSWR responses:
        // 1st call: /api/draft?draftId=...
        // 2nd call: /api/users/multiple?ids=...
        (useSWR as any).mockImplementation((key: string | null) => {
            if (key && key.includes('/api/draft')) {
                return {
                    data: mockDraft,
                    isLoading: false,
                    mutate: mockMutateDraft,
                };
            }
            if (key && key.includes('/api/users/multiple')) {
                return {
                    data: [mockOwner, mockCoCook],
                    isLoading: false,
                    mutate: vi.fn(),
                };
            }
            return {
                data: null,
                isLoading: false,
                mutate: vi.fn(),
            };
        });

        // Mock clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('renders invite link, owner and co-cook roster', () => {
        render(<DraftInviteModal currentUser={mockOwner} />);

        expect(screen.getByTestId('draft-invite-modal')).toBeInTheDocument();
        expect(screen.getByTestId('invite-link-input')).toHaveValue(
            `${window.location.origin}/recipes/new?draft=draft-abc-123&token=secret-token-xyz`
        );
        expect(screen.getByTestId('role-badge-owner')).toBeInTheDocument();
        expect(
            screen.getByTestId('collaborator-item-user-cocook')
        ).toBeInTheDocument();
    });

    it('copies invite link to clipboard', async () => {
        render(<DraftInviteModal currentUser={mockOwner} />);

        const copyBtn = screen.getByTestId('copy-invite-link-btn');
        await waitFor(() => {
            fireEvent.click(copyBtn);
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            `${window.location.origin}/recipes/new?draft=draft-abc-123&token=secret-token-xyz`
        );
    });

    it('allows draft owner to regenerate invite link after confirmation', async () => {
        (axios.post as any).mockResolvedValueOnce({
            data: { draftId: 'draft-abc-123', inviteToken: 'new-token-456' },
        });

        render(<DraftInviteModal currentUser={mockOwner} />);

        const regenBtn = screen.getByTestId('regenerate-invite-link-btn');
        fireEvent.click(regenBtn);

        expect(
            screen.getByTestId('regenerate-confirm-box')
        ).toBeInTheDocument();

        const confirmBtn = screen.getByTestId('regenerate-confirm-btn');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/draft/invite', {
                draftId: 'draft-abc-123',
                regenerate: true,
            });
            expect(mockMutateDraft).toHaveBeenCalled();
        });
    });

    it('allows draft owner to change co-cook role to viewer', async () => {
        (axios.patch as any).mockResolvedValueOnce({ data: { success: true } });

        render(<DraftInviteModal currentUser={mockOwner} />);

        const roleSelect = screen.getByTestId('role-select-user-cocook');
        expect(roleSelect).toHaveValue('editor');

        fireEvent.change(roleSelect, { target: { value: 'viewer' } });

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith('/api/draft/role', {
                draftId: 'draft-abc-123',
                targetUserId: 'user-cocook',
                role: 'viewer',
            });
            expect(mockMutateDraft).toHaveBeenCalled();
        });
    });

    it('allows draft owner to remove a co-cook', async () => {
        (axios.delete as any).mockResolvedValueOnce({
            data: { success: true },
        });

        render(<DraftInviteModal currentUser={mockOwner} />);

        const removeBtn = screen.getByTestId('remove-collaborator-user-cocook');
        fireEvent.click(removeBtn);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining(
                    '/api/draft/collaborator?draftId=draft-abc-123&userId=user-cocook'
                )
            );
            expect(mockMutateDraft).toHaveBeenCalled();
        });
    });

    it('allows non-owner co-cook to leave draft', async () => {
        (axios.delete as any).mockResolvedValueOnce({
            data: { success: true },
        });

        render(<DraftInviteModal currentUser={mockCoCook} />);

        // For non-owner co-cook, role is shown as badge, not select
        expect(
            screen.getByTestId('role-badge-user-cocook')
        ).toBeInTheDocument();

        const leaveBtn = screen.getByTestId('leave-draft-btn');
        fireEvent.click(leaveBtn);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining(
                    '/api/draft/collaborator?draftId=draft-abc-123&userId=user-cocook'
                )
            );
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
