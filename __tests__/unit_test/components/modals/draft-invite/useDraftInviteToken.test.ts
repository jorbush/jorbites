import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useDraftInviteToken } from '@/app/components/modals/draft-invite/useDraftInviteToken';
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

describe('useDraftInviteToken hook', () => {
    const mockDraft: SharedDraft = {
        draftId: 'draft-1',
        ownerId: 'owner-1',
        type: 'shared',
        inviteToken: 'token-abc',
        coCooksIds: ['user-2'],
        coCookRoles: { 'user-2': 'editor' },
        updatedAt: '2023-01-01',
    };

    const mockMutateDraft = vi.fn();
    const mockT = vi.fn(
        (key: string, options?: any) => options?.defaultValue || key
    );

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseSWR.mockReturnValue({ data: null, isLoading: false });
    });

    it('returns empty inviteUrl and effectiveToken when draftId is null or draft has no token', () => {
        const { result, rerender } = renderHook(
            (props) => useDraftInviteToken(props),
            {
                initialProps: {
                    isOpen: true,
                    draftId: null,
                    isOwner: true,
                    draft: null,
                    mutateDraft: mockMutateDraft,
                    t: mockT as any,
                },
            }
        );

        expect(result.current.inviteUrl).toBe('');
        expect(result.current.effectiveToken).toBe(undefined);

        rerender({
            isOpen: true,
            draftId: 'draft-1',
            isOwner: false,
            draft: { ...mockDraft, inviteToken: undefined },
            mutateDraft: mockMutateDraft,
            t: mockT as any,
        });

        expect(result.current.inviteUrl).toBe('');
        expect(result.current.effectiveToken).toBe(undefined);
    });

    it('uses draft.inviteToken when available', () => {
        const { result } = renderHook(() =>
            useDraftInviteToken({
                isOpen: true,
                draftId: 'draft-1',
                isOwner: true,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                t: mockT as any,
            })
        );

        expect(result.current.effectiveToken).toBe('token-abc');
        expect(result.current.inviteUrl).toContain(
            '/api/draft/join?draft=draft-1&token=token-abc'
        );
    });

    it('fetches initial token if owner and draft does not have an inviteToken', async () => {
        let swrFetcher: any = null;
        mockedUseSWR.mockImplementation((key: string, fetcher: any) => {
            if (
                typeof key === 'string' &&
                key.startsWith('/api/draft/invite?')
            ) {
                swrFetcher = fetcher;
                return {
                    data: { inviteToken: 'initial-gen-token' },
                    isLoading: false,
                };
            }
            return { data: null, isLoading: false };
        });

        mockedAxios.post.mockResolvedValueOnce({
            data: {
                inviteToken: 'initial-gen-token',
                draft: { ...mockDraft, inviteToken: 'initial-gen-token' },
            },
        });

        const draftWithoutToken: SharedDraft = {
            ...mockDraft,
            inviteToken: undefined,
        };

        const { result } = renderHook(() =>
            useDraftInviteToken({
                isOpen: true,
                draftId: 'draft-1',
                isOwner: true,
                draft: draftWithoutToken,
                mutateDraft: mockMutateDraft,
                t: mockT as any,
            })
        );

        expect(mockedUseSWR).toHaveBeenCalledWith(
            '/api/draft/invite?draftId=draft-1',
            expect.any(Function),
            expect.any(Object)
        );

        await act(async () => {
            await swrFetcher?.();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('/api/draft/invite', {
            draftId: 'draft-1',
            regenerate: false,
        });
        expect(result.current.effectiveToken).toBe('initial-gen-token');
        expect(result.current.inviteUrl).toContain('token=initial-gen-token');
    });

    it('regenerates token successfully when handleRegenerate is called', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                inviteToken: 'new-token-123',
                draft: { ...mockDraft, inviteToken: 'new-token-123' },
            },
        });

        const { result } = renderHook(() =>
            useDraftInviteToken({
                isOpen: true,
                draftId: 'draft-1',
                isOwner: true,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRegenerate();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('/api/draft/invite', {
            draftId: 'draft-1',
            regenerate: true,
        });
        expect(result.current.effectiveToken).toBe('new-token-123');
        expect(result.current.inviteUrl).toContain('token=new-token-123');
        expect(mockMutateDraft).toHaveBeenCalledWith(
            expect.objectContaining({ inviteToken: 'new-token-123' }),
            false
        );
        expect(mockedMutate).toHaveBeenCalledWith('/api/draft/active');
        expect(mockedMutate).toHaveBeenCalledWith('/api/draft?draftId=draft-1');
        expect(toast.success).toHaveBeenCalledWith('Invite link regenerated!');
    });

    it('handles regeneration error and shows error toast', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() =>
            useDraftInviteToken({
                isOpen: true,
                draftId: 'draft-1',
                isOwner: true,
                draft: mockDraft,
                mutateDraft: mockMutateDraft,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRegenerate();
        });

        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
        expect(result.current.isRegenerating).toBe(false);
    });

    it('does nothing on handleRegenerate if draftId is null', async () => {
        const { result } = renderHook(() =>
            useDraftInviteToken({
                isOpen: true,
                draftId: null,
                isOwner: true,
                draft: null,
                mutateDraft: mockMutateDraft,
                t: mockT as any,
            })
        );

        await act(async () => {
            await result.current.handleRegenerate();
        });

        expect(mockedAxios.post).not.toHaveBeenCalled();
    });
});
