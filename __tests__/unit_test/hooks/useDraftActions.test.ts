import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useDraftActions } from '@/app/hooks/useDraftActions';
import { SafeUser } from '@/app/types';

vi.mock('axios');
vi.mock('swr', () => ({
    mutate: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Chef Tester',
    email: 'test@example.com',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

describe('useDraftActions hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createDraft', () => {
        it('returns null if currentUser is null', async () => {
            const { result } = renderHook(() =>
                useDraftActions({ currentUser: null })
            );

            let draftId: string | null = null;
            await act(async () => {
                draftId = await result.current.createDraft('solo');
            });

            expect(draftId).toBeNull();
            expect(axios.post).not.toHaveBeenCalled();
        });

        it('creates solo draft via POST /api/draft', async () => {
            (axios.post as any).mockResolvedValueOnce({
                data: { draftId: 'solo-draft-123' },
            });
            const onMutate = vi.fn();

            const { result } = renderHook(() =>
                useDraftActions({
                    currentUser: mockUser,
                    onDraftMutate: onMutate,
                })
            );

            let draftId: string | null = null;
            await act(async () => {
                draftId = await result.current.createDraft('solo');
            });

            expect(draftId).toBe('solo-draft-123');
            expect(axios.post).toHaveBeenCalledWith(
                '/api/draft',
                expect.any(Object)
            );
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
            expect(onMutate).toHaveBeenCalled();
        });

        it('creates shared draft via POST /api/draft/invite', async () => {
            (axios.post as any).mockResolvedValueOnce({
                data: { draftId: 'shared-draft-456' },
            });

            const { result } = renderHook(() =>
                useDraftActions({ currentUser: mockUser })
            );

            let draftId: string | null = null;
            await act(async () => {
                draftId = await result.current.createDraft('shared');
            });

            expect(draftId).toBe('shared-draft-456');
            expect(axios.post).toHaveBeenCalledWith(
                '/api/draft/invite',
                expect.any(Object)
            );
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
        });

        it('handles 409 max drafts limit reached', async () => {
            (axios.post as any).mockRejectedValueOnce({
                response: { status: 409 },
            });

            const { result } = renderHook(() =>
                useDraftActions({ currentUser: mockUser })
            );

            let draftId: string | null = null;
            await act(async () => {
                draftId = await result.current.createDraft('solo');
            });

            expect(draftId).toBeNull();
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe('deleteDraft', () => {
        it('deletes draft via DELETE /api/draft and mutates active drafts', async () => {
            (axios.delete as any).mockResolvedValueOnce({ data: 1 });
            const onMutate = vi.fn();

            const { result } = renderHook(() =>
                useDraftActions({
                    currentUser: mockUser,
                    onDraftMutate: onMutate,
                })
            );

            let success = false;
            await act(async () => {
                success = await result.current.deleteDraft('draft-to-delete');
            });

            expect(success).toBe(true);
            expect(axios.delete).toHaveBeenCalledWith(
                '/api/draft?draftId=draft-to-delete'
            );
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
            expect(toast.success).toHaveBeenCalled();
            expect(onMutate).toHaveBeenCalled();
        });

        it('handles delete error gracefully', async () => {
            (axios.delete as any).mockRejectedValueOnce(
                new Error('Network error')
            );

            const { result } = renderHook(() =>
                useDraftActions({ currentUser: mockUser })
            );

            let success = true;
            await act(async () => {
                success = await result.current.deleteDraft('draft-to-delete');
            });

            expect(success).toBe(false);
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe('duplicateDraft', () => {
        it('fetches existing draft and creates a clone', async () => {
            (axios.get as any).mockResolvedValueOnce({
                data: {
                    draftId: 'orig-draft',
                    title: 'Pasta',
                    ingredients: ['Flour', 'Eggs'],
                    type: 'solo',
                },
            });
            (axios.post as any).mockResolvedValueOnce({
                data: { draftId: 'cloned-draft-789' },
            });
            const onMutate = vi.fn();

            const { result } = renderHook(() =>
                useDraftActions({
                    currentUser: mockUser,
                    onDraftMutate: onMutate,
                })
            );

            let newDraftId: string | null = null;
            await act(async () => {
                newDraftId = await result.current.duplicateDraft('orig-draft');
            });

            expect(newDraftId).toBe('cloned-draft-789');
            expect(axios.get).toHaveBeenCalledWith(
                '/api/draft?draftId=orig-draft'
            );
            expect(axios.post).toHaveBeenCalledWith(
                '/api/draft',
                expect.objectContaining({
                    title: 'Pasta (Copy)',
                    ingredients: ['Flour', 'Eggs'],
                })
            );
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
            expect(toast.success).toHaveBeenCalled();
            expect(onMutate).toHaveBeenCalled();
        });
    });

    describe('shareDraft', () => {
        it('copies invite link to clipboard for already shared draft', async () => {
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
            });

            (axios.get as any).mockResolvedValueOnce({
                data: {
                    draftId: 'shared-123',
                    inviteToken: 'tok-abc',
                    type: 'shared',
                },
            });

            const { result } = renderHook(() =>
                useDraftActions({ currentUser: mockUser })
            );

            let url: string | null = null;
            await act(async () => {
                url = await result.current.shareDraft('shared-123');
            });

            expect(url).toContain(
                '/api/draft/join?draft=shared-123&token=tok-abc'
            );
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
            expect(toast.success).toHaveBeenCalled();
        });

        it('generates token via POST /api/draft/invite if draft is not yet shared', async () => {
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
            });

            (axios.get as any).mockResolvedValueOnce({
                data: {
                    draftId: 'solo-123',
                    title: 'Solo to Shared',
                },
            });
            (axios.post as any).mockResolvedValueOnce({
                data: {
                    draftId: 'solo-123',
                    inviteToken: 'new-token-xyz',
                },
            });

            const { result } = renderHook(() =>
                useDraftActions({ currentUser: mockUser })
            );

            let url: string | null = null;
            await act(async () => {
                url = await result.current.shareDraft('solo-123');
            });

            expect(url).toContain(
                '/api/draft/join?draft=solo-123&token=new-token-xyz'
            );
            expect(axios.post).toHaveBeenCalledWith(
                '/api/draft/invite',
                expect.any(Object)
            );
            expect(mutate).toHaveBeenCalledWith('/api/draft/active');
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
        });
    });
});
