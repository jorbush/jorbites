import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useDraftPersistence } from '@/app/hooks/useDraftPersistence';
import { STEPS } from '@/app/utils/constants';

vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
vi.mock('swr', () => ({
    mutate: vi.fn(),
}));

describe('useDraftPersistence hook', () => {
    const mockOnOpenSharedDraft = vi.fn();
    const mockMutateDraft = vi.fn();
    const recipeModal = {
        activeDraftId: undefined,
        onOpenSharedDraft: mockOnOpenSharedDraft,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('saves draft successfully and updates form and active draft state', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockResolvedValueOnce({
            data: { draftId: 'draft-abc', inviteToken: 'token-xyz' },
        });

        const formValues: Record<string, any> = {
            title: 'Test Soup',
            categories: ['soup'],
        };
        const form = {
            getValues: vi.fn((key: string) => formValues[key]),
            setValue: vi.fn((key: string, val: any) => {
                formValues[key] = val;
            }),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.saveDraft(
                form,
                STEPS.DESCRIPTION,
                null,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/draft',
            expect.objectContaining({
                title: 'Test Soup',
                categories: ['soup'],
                currentStep: STEPS.DESCRIPTION,
            })
        );
        expect(form.setValue).toHaveBeenCalledWith('draftId', 'draft-abc');
        expect(form.setValue).toHaveBeenCalledWith('inviteToken', 'token-xyz');
        expect(mockOnOpenSharedDraft).toHaveBeenCalledWith('draft-abc');
        expect(mockMutateDraft).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('draft_saved');
    });

    it('handles save draft error gracefully', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

        const form = {
            getValues: vi.fn(() => undefined),
            setValue: vi.fn(),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.saveDraft(
                form,
                STEPS.CATEGORY,
                null,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(toast.error).toHaveBeenCalledWith('error_saving_draft');
    });

    it('deletes draft and clears form identifiers and immediate SWR cache', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

        const form = {
            getValues: vi.fn((key: string) =>
                key === 'draftId' ? 'draft-to-delete' : undefined
            ),
            setValue: vi.fn(),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.deleteDraft(form, null);
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/draft?draftId=draft-to-delete'
        );
        expect(form.setValue).toHaveBeenCalledWith('draftId', '');
        expect(form.setValue).toHaveBeenCalledWith('inviteToken', '');
        expect(mockMutateDraft).toHaveBeenCalled();
        expect(mutate).toHaveBeenCalledWith('/api/draft', null, false);
        expect(mutate).toHaveBeenCalledWith(
            '/api/draft?draftId=draft-to-delete',
            null,
            false
        );
        expect(mutate).toHaveBeenCalledWith('/api/draft/active');
    });

    it('serializes concurrent saves through saveQueue and binds draftId sequentially', async () => {
        const mockedAxios = vi.mocked(axios);
        const executionOrder: string[] = [];

        mockedAxios.post
            .mockImplementationOnce(async () => {
                executionOrder.push('start-save-1');
                await new Promise((res) => setTimeout(res, 30));
                executionOrder.push('end-save-1');
                return { data: { draftId: 'draft-assigned-1' } };
            })
            .mockImplementationOnce(async () => {
                executionOrder.push('start-save-2');
                await new Promise((res) => setTimeout(res, 10));
                executionOrder.push('end-save-2');
                return { data: { draftId: 'draft-assigned-1' } };
            });

        const formValues: Record<string, unknown> = {
            title: 'Initial Title',
            categories: ['cake'],
        };
        const form = {
            getValues: vi.fn((key: string) => formValues[key]),
            setValue: vi.fn((key: string, val: unknown) => {
                formValues[key] = val;
            }),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        let save1Promise: Promise<boolean>;
        let save2Promise: Promise<boolean>;

        await act(async () => {
            // Trigger rapid concurrent saves
            save1Promise = result.current.saveDraft(
                form,
                STEPS.CATEGORY,
                null,
                0,
                0,
                'list',
                'list',
                STEPS.DESCRIPTION
            );
            save2Promise = result.current.saveDraft(
                form,
                STEPS.DESCRIPTION,
                null,
                0,
                0,
                'list',
                'list',
                STEPS.INGREDIENTS
            );

            await Promise.all([save1Promise, save2Promise]);
            await result.current.flushDraftSaves();
        });

        // Verify strictly serialized execution order
        expect(executionOrder).toEqual([
            'start-save-1',
            'end-save-1',
            'start-save-2',
            'end-save-2',
        ]);
        expect(formValues.draftId).toBe('draft-assigned-1');
    });

    it('calls POST /api/draft/invite only once in copyInviteLink even if ClipboardItem throws (H9)', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockResolvedValueOnce({
            data: { draftId: 'draft-invite-1', inviteToken: 'token-xyz' },
        });

        const writeMock = vi
            .fn()
            .mockRejectedValue(new Error('ClipboardItem not supported'));
        const writeTextMock = vi.fn().mockResolvedValue(undefined);

        Object.assign(navigator, {
            clipboard: {
                write: writeMock,
                writeText: writeTextMock,
            },
        });
        (global as any).ClipboardItem = vi.fn();

        const formValues: Record<string, any> = {};
        const form = {
            getValues: vi.fn((key: string) => formValues[key]),
            setValue: vi.fn((key: string, val: any) => {
                formValues[key] = val;
            }),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.copyInviteLink(
                form,
                STEPS.CATEGORY,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/draft/invite',
            expect.anything()
        );
        expect(writeTextMock).toHaveBeenCalledWith(
            expect.stringContaining('draft=draft-invite-1&token=token-xyz')
        );
    });

    it('resets openedDraftIdRef when modal closes, allowing re-opened draft to trigger onOpenSharedDraft (M6)', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockResolvedValue({
            data: {
                type: 'shared',
                draftId: 'draft-shared-1',
                inviteToken: 'token-xyz',
            },
        });

        const form = {
            getValues: vi.fn(() => ({})),
            setValue: vi.fn(),
        };

        let modalState = {
            isOpen: true,
            activeDraftId: 'draft-shared-1',
            onOpenSharedDraft: mockOnOpenSharedDraft,
        };

        const { result, rerender } = renderHook(
            ({ modal }) =>
                useDraftPersistence({
                    recipeModal: modal as any,
                    mutateDraft: mockMutateDraft,
                }),
            { initialProps: { modal: modalState } }
        );

        // Modal closes
        modalState = {
            isOpen: false,
            activeDraftId: undefined as any,
            onOpenSharedDraft: mockOnOpenSharedDraft,
        };
        rerender({ modal: modalState });

        // Modal reopens and saves shared draft
        modalState = {
            isOpen: true,
            activeDraftId: undefined as any,
            onOpenSharedDraft: mockOnOpenSharedDraft,
        };
        rerender({ modal: modalState });

        await act(async () => {
            await result.current.saveDraft(
                form,
                STEPS.DESCRIPTION,
                null,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(mockOnOpenSharedDraft).toHaveBeenCalledWith('draft-shared-1');
    });
});
