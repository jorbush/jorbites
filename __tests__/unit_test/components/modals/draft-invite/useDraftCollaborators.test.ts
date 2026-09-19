import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useDraftCollaborators } from '@/app/components/modals/draft-invite/useDraftCollaborators';
import { SafeUser } from '@/app/types';
import { SharedDraft } from '@/app/types/draft';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('swr', async () => {
    const actual = await vi.importActual<any>('swr');
    return {
        ...actual,
        default: vi.fn(),
        mutate: vi.fn(),
    };
});
const mockedUseSWR = useSWR as any;
const mockedMutate = mutate as any;

describe('useDraftCollaborators hook', () => {
    const mockCurrentUser: SafeUser = {
        id: 'user-1',
        name: 'Current Chef',
        email: 'user1@example.com',
        favoriteIds: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
    };

    const mockOtherUser: SafeUser = {
        id: 'user-2',
        name: 'Other Chef',
        email: 'user2@example.com',
        favoriteIds: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
    };

    const mockDraft: SharedDraft = {
        draftId: 'draft-1',
        ownerId: 'user-1',
        type: 'shared',
        inviteToken: 'token-abc',
        coCooksIds: ['user-2'],
        coCookRoles: { 'user-2': 'editor' },
        updatedAt: '2023-01-01',
    };

    const mockMutateDraft = vi.fn();
    const mockOnClose = vi.fn();
    const mockT = vi.fn(
        (key: string, options?: any) => options?.defaultValue || key
    );

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseSWR.mockImplementation((key: string) => {
            if (
                typeof key === 'string' &&
                key.startsWith('/api/users/multiple')
            ) {
                return {
                    data: [mockCurrentUser, mockOtherUser],
                    isLoading: false,
                };
            }
            return { data: null, isLoading: false };
        });
    });

    it('builds usersMap correctly from SWR fetched users', () => {
        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        expect(result.current.usersMap.get('user-1')).toEqual(mockCurrentUser);
        expect(result.current.usersMap.get('user-2')).toEqual(mockOtherUser);
        expect(result.current.usersMap.size).toBe(2);
    });

    it('handles role change via PATCH /api/draft/role', async () => {
        mockedAxios.patch.mockResolvedValueOnce({
            data: { draft: mockDraft },
        });

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRoleChange('user-2', 'viewer');
        });

        expect(mockedAxios.patch).toHaveBeenCalledWith('/api/draft/role', {
            draftId: 'draft-1',
            targetUserId: 'user-2',
            role: 'viewer',
        });
        expect(mockMutateDraft).toHaveBeenCalled();
        expect(mockedMutate).toHaveBeenCalledWith('/api/draft/active');
        expect(mockedMutate).toHaveBeenCalledWith('/api/draft?draftId=draft-1');
        expect(toast.success).toHaveBeenCalledWith('Role updated');
        expect(result.current.mutatingUserId).toBe(null);
    });

    it('handles role change error and reverts mutation', async () => {
        mockedAxios.patch.mockRejectedValueOnce(new Error('Update failed'));

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRoleChange('user-2', 'viewer');
        });

        expect(mockMutateDraft).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Failed to update role');
        expect(result.current.mutatingUserId).toBe(null);
    });

    it('handles removing another collaborator via DELETE /api/draft/collaborator', async () => {
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRemoveCollaborator('user-2');
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/draft/collaborator?draftId=draft-1&userId=user-2'
        );
        expect(toast.success).toHaveBeenCalledWith('Co-cook removed');
        expect(mockMutateDraft).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('handles self-removal by calling onClose and showing left_draft toast', async () => {
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRemoveCollaborator('user-1');
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/draft/collaborator?draftId=draft-1&userId=user-1'
        );
        expect(toast.success).toHaveBeenCalledWith('You have left the draft');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles remove collaborator error and shows error toast', async () => {
        mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRemoveCollaborator('user-2');
        });

        expect(toast.error).toHaveBeenCalledWith(
            'Failed to remove collaborator'
        );
        expect(result.current.mutatingUserId).toBe(null);
    });

    it('handles adding collaborator via POST /api/draft/collaborator', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { draft: mockDraft },
        });

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

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
        expect(toast.success).toHaveBeenCalledWith('Co-cook added');
        expect(result.current.isAddingUser).toBe(false);
    });

    it('prevents adding collaborator when maximum limit is reached', async () => {
        const fullDraft: SharedDraft = {
            ...mockDraft,
            coCooksIds: ['u1', 'u2', 'u3', 'u4'],
        };

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: fullDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleAddCollaborator({
                id: 'user-5',
                name: 'Extra Chef',
            } as any);
        });

        expect(toast.error).toHaveBeenCalledWith(
            'Maximum of 4 co-cooks allowed'
        );
        expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('handles add collaborator error with custom message', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: { data: { message: 'Custom API Error' } },
        });

        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: 'draft-1',
                currentUser: mockCurrentUser,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleAddCollaborator({
                id: 'user-3',
                name: 'New Chef',
            } as any);
        });

        expect(toast.error).toHaveBeenCalledWith('Custom API Error');
        expect(result.current.isAddingUser).toBe(false);
    });

    it('does nothing when draftId is null', async () => {
        const { result } = renderHook(() =>
            useDraftCollaborators({
                isOpen: true,
                draftId: null,
                currentUser: mockCurrentUser,
                draft: null,
                mutateDraft: mockMutateDraft,
                onClose: mockOnClose,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRoleChange('user-2', 'viewer');
            await result.current.handleRemoveCollaborator('user-2');
            await result.current.handleAddCollaborator(mockOtherUser);
        });

        expect(mockedAxios.patch).not.toHaveBeenCalled();
        expect(mockedAxios.delete).not.toHaveBeenCalled();
        expect(mockedAxios.post).not.toHaveBeenCalled();
    });
});
