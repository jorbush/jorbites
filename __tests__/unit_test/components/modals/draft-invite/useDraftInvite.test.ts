import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { useDraftInvite } from '@/app/components/modals/draft-invite/useDraftInvite';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';
import useSWR from 'swr';
import { SafeUser } from '@/app/types';
import { toast } from 'react-hot-toast';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('swr');
const mockedUseSWR = useSWR as any;

vi.mock('@/app/hooks/useDraftInviteModal');
const mockedUseDraftInviteModal = useDraftInviteModal as any;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('useDraftInvite hook', () => {
    const mockOwner: SafeUser = {
        id: 'owner-1',
        name: 'Owner Chef',
        email: 'owner@example.com',
        favoriteIds: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
    };

    const mockDraft = {
        draftId: 'draft-1',
        ownerId: 'owner-1',
        type: 'shared',
        inviteToken: 'token-abc',
        coCooksIds: ['user-2'],
        coCookRoles: { 'user-2': 'editor' },
    };

    const mockMutate = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseDraftInviteModal.mockReturnValue({
            isOpen: true,
            draftId: 'draft-1',
            onClose: mockOnClose,
        });

        mockedUseSWR.mockImplementation((key: string) => {
            if (typeof key === 'string' && key.startsWith('/api/draft?')) {
                return {
                    data: mockDraft,
                    isLoading: false,
                    mutate: mockMutate,
                };
            }
            if (
                typeof key === 'string' &&
                key.startsWith('/api/users/multiple')
            ) {
                return {
                    data: [mockOwner],
                    isLoading: false,
                };
            }
            return { data: null, isLoading: false };
        });
    });

    it('computes inviteUrl and identifies owner correctly', () => {
        const { result } = renderHook(() => useDraftInvite(mockOwner));

        expect(result.current.isOwner).toBe(true);
        expect(result.current.inviteUrl).toContain('draft=draft-1');
        expect(result.current.inviteUrl).toContain('token=token-abc');
    });

    it('handles role change via PATCH /api/draft/role', async () => {
        mockedAxios.patch.mockResolvedValueOnce({
            data: { draft: mockDraft },
        });

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleRoleChange('user-2', 'viewer');
        });

        expect(mockedAxios.patch).toHaveBeenCalledWith('/api/draft/role', {
            draftId: 'draft-1',
            targetUserId: 'user-2',
            role: 'viewer',
        });
    });

    it('handles collaborator removal via DELETE /api/draft/collaborator', async () => {
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleRemoveCollaborator('user-2');
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/draft/collaborator?draftId=draft-1&userId=user-2'
        );
    });

    it('handles adding collaborator via POST /api/draft/collaborator', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { draft: mockDraft },
        });

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleAddCollaborator({
                id: 'user-3',
                name: 'New Chef',
            } as any);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/draft/collaborator',
            {
                draftId: 'draft-1',
                userId: 'user-3',
                role: 'editor',
            }
        );
    });

    it('shows error toast when handleRoleChange rejects', async () => {
        mockedAxios.patch.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleRoleChange('user-2', 'viewer');
        });

        expect(toast.error).toHaveBeenCalledWith('Failed to update role');
    });

    it('shows error toast when handleRemoveCollaborator rejects', async () => {
        mockedAxios.delete.mockRejectedValueOnce(new Error('Server Error'));

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleRemoveCollaborator('user-2');
        });

        expect(toast.error).toHaveBeenCalledWith(
            'Failed to remove collaborator'
        );
    });

    it('shows error toast when handleAddCollaborator rejects', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: { data: { error: 'Custom Add Error' } },
        });

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleAddCollaborator({
                id: 'user-3',
                name: 'New Chef',
            } as any);
        });

        expect(toast.error).toHaveBeenCalledWith('Custom Add Error');
    });

    it('shows error toast when handleRegenerate rejects', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Regenerate Failed'));

        const { result } = renderHook(() => useDraftInvite(mockOwner));

        await act(async () => {
            await result.current.handleRegenerate();
        });

        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
});
